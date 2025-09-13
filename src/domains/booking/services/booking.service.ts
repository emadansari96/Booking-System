import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { BookingEntity } from '../entities/booking.entity';
import { BookingRepositoryInterface } from '../interfaces/booking-repository.interface';
import { RedisLockService } from '../../../shared/infrastructure/redis/redis-lock.service';
import { NotificationService } from '../../notification/services/notification.service';
import { PricingService } from '../../pricing/services/pricing.service';
import { InvoiceService } from '../../payment/services/invoice.service';
import { UserRepositoryInterface } from '../../user-management/interfaces/user-repository.interface';
import { CommissionStrategyRepositoryInterface } from '../../pricing/interfaces/commission-strategy-repository.interface';
import { ResourceRepositoryInterface } from '../../resource-management/interfaces/resource-repository.interface';
import { ResourceItemRepositoryInterface } from '../../resource-management/interfaces/resource-item-repository.interface';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';
import { BookingNotFoundException, BookingPeriodOverlapException, BookingExpiredException, BookingCancelledException, BookingAlreadyConfirmedException, ResourceItemNotAvailableException, InvalidBookingPeriodException } from '../../../shared/exceptions/booking.exceptions';
export interface CreateBookingRequest {
  userId: UuidValueObject;
  resourceItemId: UuidValueObject;
  startDate: Date;
  endDate: Date;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BookingResult {
  success: boolean;
  message: string;
  booking?: BookingEntity;
  invoice?: any;
  invoiceStatus?: string;
  invoiceError?: string;
  error?: string;
}

export interface BookingAvailabilityRequest {
  resourceItemId: UuidValueObject;
  startDate: Date;
  endDate: Date;
  excludeBookingId?: UuidValueObject;
}

export interface BookingAvailabilityResult {
  isAvailable: boolean;
  conflictingBookings: BookingEntity[];
  message: string;
}
@Injectable()
export class BookingService {
  constructor(
    @Inject('BookingRepositoryInterface')
    private readonly bookingRepository: BookingRepositoryInterface,
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface,
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
    private readonly redisLockService: RedisLockService,
    private readonly notificationService: NotificationService,
    private readonly pricingService: PricingService,
    private readonly invoiceService: InvoiceService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new booking with Redis locking and GIST index validation
   */
  async createBooking(request: CreateBookingRequest): Promise<BookingResult> {
    try {
      // Validate booking period
      if (request.endDate <= request.startDate) {
        throw new InvalidBookingPeriodException(request.startDate, request.endDate);
      }

      // Validate user exists
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get resource from resource item
      const resourceItem = await this.resourceItemRepository.findById(request.resourceItemId);
      if (!resourceItem) {
        throw new Error('Resource item not found');
      }

      // Check if resource item is available
      if (!resourceItem.isActive || resourceItem.status.value !== 'AVAILABLE') {
        throw new ResourceItemNotAvailableException(request.resourceItemId.value);
      }

      const resource = await this.resourceRepository.findById(resourceItem.resourceId);
      if (!resource) {
        throw new Error('Resource not found');
      }

      // Validate resource item belongs to resource
      if (!resourceItem.resourceId.equals(resource.id)) {
        throw new Error('Resource item does not belong to the specified resource');
      }

      // Validate dates
      if (request.startDate >= request.endDate) {
        return {
          success: false,
          message: 'Start date must be before end date',
          error: 'INVALID_DATE_RANGE',
        };
      }

      if (request.startDate < new Date()) {
        return {
          success: false,
          message: 'Start date cannot be in the past',
          error: 'START_DATE_IN_PAST',
        };
      }

      // Acquire Redis lock for the booking period
      const lockResult = await this.redisLockService.acquireBookingLock(
        request.resourceItemId.value,
        request.startDate,
        request.endDate,
        {
          ttl: 30, // 30 seconds lock
          maxRetries: 3,
        }
      );

      if (!lockResult.success) {
        return {
          success: false,
          message: 'Booking period is currently being processed by another user',
          error: 'PERIOD_LOCKED',
        };
      }

      try {
        // Calculate pricing first
        const commissionStrategies = await this.commissionStrategyRepository.findActiveStrategies();
        const pricingResult = this.pricingService.calculatePricing({
          resourceId: resource.id,
          resourceType: resource.type.value,
          bookingDurationHours: Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60)),
          basePrice: resourceItem.price.value,
          currency: resourceItem.price.currency,
          startDate: request.startDate,
          endDate: request.endDate,
        }, commissionStrategies);

        console.log('Pricing result for booking:', {
          basePrice: pricingResult.basePrice,
          commission: pricingResult.commission,
          totalPrice: pricingResult.totalPrice,
          currency: pricingResult.currency
        });

        // Create booking entity
        const booking = BookingEntity.create(
          UuidValueObject.generate(),
          request.userId,
          request.resourceItemId,
          request.startDate,
          request.endDate,
          pricingResult.subtotal, // Use subtotal as basePrice for booking
          pricingResult.commission,
          pricingResult.currency,
          request.notes,
          this.configService.get<number>('BOOKING_PAYMENT_DEADLINE_MINUTES', 10),
          request.metadata,
          pricingResult.totalPrice
        );

        // Try to save booking directly - GIST index will prevent overlaps
        let savedBooking: BookingEntity;
        try {
          savedBooking = await this.bookingRepository.save(booking);
        } catch (error) {
          // Check if it's an overlap constraint violation
          if (error.code === 'OVERLAP_CONSTRAINT' || error.message?.includes('overlaps')) {
            throw new BookingPeriodOverlapException(request.startDate, request.endDate);
          }
          // Re-throw other errors
          throw error;
        }

        // Log successful booking creation
        await this.auditLogService.logEntityCreation(
          request.userId,
          AuditDomain.BOOKING,
          'Booking',
          savedBooking.id.value,
          {
            resourceItemId: request.resourceItemId.value,
            startDate: request.startDate.toISOString(),
            endDate: request.endDate.toISOString(),
            totalPrice: savedBooking.price.totalPrice,
            currency: savedBooking.price.currency,
            status: savedBooking.status.value,
          }
        );

        // Create invoice automatically (no payment yet)
        let invoiceResult;
        try {
          invoiceResult = await this.invoiceService.createInvoice({
            userId: request.userId,
            items: [{
              resourceId: resource.id,
              resourceItemId: request.resourceItemId,
              description: `Booking for ${resource.name}`,
              quantity: 1,
              unitPrice: pricingResult.totalPrice,
              metadata: {
                bookingId: savedBooking.id.value,
                resourceItemId: request.resourceItemId.value,
                resourceName: resource.name,
              },
            }],
            currency: resourceItem.price.currency,
            dueDate: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
            taxRate: 0,
            discountAmount: 0,
            description: `Invoice for booking ${savedBooking.id.value}`,
            metadata: {
              bookingId: savedBooking.id.value,
              resourceItemId: request.resourceItemId.value,
              resourceName: resource.name,
            },
          });
        } catch (invoiceError) {
          console.error('Invoice creation failed:', invoiceError);
          // Log invoice creation failure but don't fail the booking
          await this.auditLogService.logEntityCreation(
            request.userId,
            AuditDomain.INVOICE,
            'Invoice Creation Failed',
            'N/A',
            {
              bookingId: savedBooking.id.value,
              error: invoiceError.message,
              resourceItemId: request.resourceItemId.value,
            }
          );
          invoiceResult = { success: false, message: 'Invoice creation failed', error: invoiceError.message };
        }

        // Send notification to user
        try {
          await this.notificationService.createNotification({
            userId: request.userId,
            type: 'BOOKING_CREATED',
            title: 'Booking Reserved Successfully',
            message: `Your booking for ${resource.name.value} has been reserved. Please complete payment within ${this.configService.get<number>('BOOKING_PAYMENT_DEADLINE_MINUTES', 5)} minutes to confirm your reservation.`,
            priority: 'HIGH',
            email: user.email.value,
            metadata: {
              bookingId: savedBooking.id.value,
              invoiceId: invoiceResult.invoice?.id.value,
              resourceName: resource.name.value,
              startDate: request.startDate.toISOString(),
              endDate: request.endDate.toISOString(),
              totalPrice: savedBooking.price.totalPrice,
              currency: savedBooking.price.currency,
              paymentDeadline: savedBooking.paymentDeadline?.toISOString(),
            },
          });
        } catch (notificationError) {
          console.error('Notification creation failed:', notificationError);
        }

        return {
          success: true,
          message: 'Booking created successfully',
          booking: savedBooking,
          invoice: invoiceResult.invoice,
          invoiceStatus: invoiceResult.success ? 'created' : 'failed',
          invoiceError: invoiceResult.error,
        };

      } finally {
        // Always release the Redis lock
        await this.redisLockService.releaseBookingLock(lockResult.lockKey!);
      }

    } catch (error) {
      // Check if it's a GIST index constraint violation
      if (error.message && error.message.includes('gist')) {
        return {
          success: false,
          message: 'Booking period overlaps with an existing booking',
          error: 'PERIOD_OVERLAP',
        };
      }

      return {
        success: false,
        message: `Failed to create booking: ${error.message}`,
        error: 'BOOKING_CREATION_FAILED',
      };
    }
  }

  /**
   * Confirm a booking after payment
   */
  async confirmBooking(bookingId: UuidValueObject): Promise<BookingResult> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        throw new BookingNotFoundException(bookingId.value);
      }

      if (!booking.canBeConfirmed()) {
        if (booking.status.value === 'CONFIRMED') {
          throw new BookingAlreadyConfirmedException(bookingId.value);
        }
        if (booking.status.value === 'CANCELLED') {
          throw new BookingCancelledException(bookingId.value);
        }
        if (booking.status.value === 'EXPIRED') {
          throw new BookingExpiredException(bookingId.value);
        }
        throw new Error(`Cannot confirm booking with status: ${booking.status.value}`);
      }

      booking.confirm();
      const savedBooking = await this.bookingRepository.save(booking);

      // Send confirmation notification
      await this.notificationService.createNotification({
        userId: booking.userId,
        type: 'BOOKING_CONFIRMATION',
        title: 'Booking Confirmed',
        message: `Your booking has been confirmed and is ready for use.`,
        priority: 'HIGH',
        metadata: {
          bookingId: booking.id.value,
          startDate: booking.period.startDate.toISOString(),
          endDate: booking.period.endDate.toISOString(),
        },
      });

      return {
        success: true,
        message: 'Booking confirmed successfully',
        booking: savedBooking,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to confirm booking: ${error.message}`,
        error: 'BOOKING_CONFIRMATION_FAILED',
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: UuidValueObject, reason?: string): Promise<BookingResult> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND',
        };
      }

      if (!booking.canBeCancelled()) {
        return {
          success: false,
          message: `Cannot cancel booking with status: ${booking.status.value}`,
          error: 'INVALID_BOOKING_STATUS',
        };
      }

      booking.cancel(reason);
      const savedBooking = await this.bookingRepository.save(booking);

      // Send cancellation notification
      await this.notificationService.createNotification({
        userId: booking.userId,
        type: 'BOOKING_CANCELLATION',
        title: 'Booking Cancelled',
        message: `Your booking has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
        priority: 'NORMAL',
        metadata: {
          bookingId: booking.id.value,
          reason,
        },
      });

      return {
        success: true,
        message: 'Booking cancelled successfully',
        booking: savedBooking,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to cancel booking: ${error.message}`,
        error: 'BOOKING_CANCELLATION_FAILED',
      };
    }
  }

  /**
   * Expire a booking
   */
  async expireBooking(bookingId: UuidValueObject): Promise<BookingResult> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND',
        };
      }

      if (!booking.canExpire()) {
        return {
          success: false,
          message: `Cannot expire booking with status: ${booking.status.value}`,
          error: 'INVALID_BOOKING_STATUS',
        };
      }

      booking.expire();
      const savedBooking = await this.bookingRepository.save(booking);

      // Send expiration notification
      await this.notificationService.createNotification({
        userId: booking.userId,
        type: 'BOOKING_CANCELLATION',
        title: 'Booking Expired',
        message: `Your booking has expired due to non-payment.`,
        priority: 'NORMAL',
        metadata: {
          bookingId: booking.id.value,
          reason: 'Payment deadline exceeded',
        },
      });

      return {
        success: true,
        message: 'Booking expired successfully',
        booking: savedBooking,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to expire booking: ${error.message}`,
        error: 'BOOKING_EXPIRATION_FAILED',
      };
    }
  }

  /**
   * Complete a booking
   */
  async completeBooking(bookingId: UuidValueObject): Promise<BookingResult> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND',
        };
      }

      if (!booking.canBeCompleted()) {
        return {
          success: false,
          message: `Cannot complete booking with status: ${booking.status.value}`,
          error: 'INVALID_BOOKING_STATUS',
        };
      }

      booking.complete();
      const savedBooking = await this.bookingRepository.save(booking);

      return {
        success: true,
        message: 'Booking completed successfully',
        booking: savedBooking,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to complete booking: ${error.message}`,
        error: 'BOOKING_COMPLETION_FAILED',
      };
    }
  }

  /**
   * Check booking availability
   */
  async checkAvailability(request: BookingAvailabilityRequest): Promise<BookingAvailabilityResult> {
    try {
      const availability = await this.bookingRepository.checkAvailability(
        request.resourceItemId,
        request.startDate,
        request.endDate,
        request.excludeBookingId
      );

      return {
        isAvailable: availability.isAvailable,
        conflictingBookings: availability.conflictingBookings,
        message: availability.isAvailable ? 'Period is available' : 'Period is not available',
      };

    } catch (error) {
      return {
        isAvailable: false,
        conflictingBookings: [],
        message: `Failed to check availability: ${error.message}`,
      };
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: UuidValueObject): Promise<BookingEntity | null> {
    return await this.bookingRepository.findById(bookingId);
  }

  /**
   * Get bookings with filters
   */
  async getBookings(
    userId?: UuidValueObject,
    resourceItemId?: UuidValueObject,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    limit?: number
  ): Promise<{ bookings: BookingEntity[]; pagination: any }> {
    const criteria = {
      userId,
      resourceItemId,
      status,
      startDate,
      endDate,
      page: page || 1,
      limit: limit || 10,
      sortBy: 'createdAt' as const,
      sortOrder: 'DESC' as const
    };

    const result = await this.bookingRepository.search(criteria);
    
    return {
      bookings: result.bookings,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit)
      }
    };
  }

  /**
   * Check booking availability (alias for checkAvailability)
   */
  async checkBookingAvailability(
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<BookingAvailabilityResult> {
    return await this.checkAvailability({
      resourceItemId,
      startDate,
      endDate,
    });
  }

  /**
   * Get booking statistics
   */
  async getBookingStatistics(
    userId?: UuidValueObject,
    resourceId?: UuidValueObject,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    // This would typically aggregate booking data
    // For now, return basic statistics
    return {
      totalBookings: 0,
      confirmedBookings: 0,
      cancelledBookings: 0,
      completedBookings: 0,
      expiredBookings: 0,
      pendingBookings: 0,
      totalRevenue: 0,
      averageBookingDuration: 0,
      bookingTrends: [],
    };
  }

  /**
   * Process payment for a booking (DEPRECATED - Use invoice payment instead)
   */
  async processBookingPayment(
    bookingId: UuidValueObject,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<BookingResult> {
    throw new Error('This method is deprecated. Use invoice payment instead.');
  }

}
