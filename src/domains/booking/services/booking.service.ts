import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { BookingEntity } from '../entities/booking.entity';
import { BookingRepositoryInterface } from '../interfaces/booking-repository.interface';
import { RedisLockService } from '../../../shared/infrastructure/redis/redis-lock.service';
import { NotificationService } from '../../notification/services/notification.service';
import { PricingService } from '../../pricing/services/pricing.service';
import { PaymentService } from '../../payment/services/payment.service';
import { UserRepositoryInterface } from '../../user-management/interfaces/user-repository.interface';
import { CommissionStrategyRepositoryInterface } from '../../pricing/interfaces/commission-strategy-repository.interface';
import { ResourceRepositoryInterface } from '../../resource-management/interfaces/resource-repository.interface';
import { ResourceItemRepositoryInterface } from '../../resource-management/interfaces/resource-item-repository.interface';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';

export interface CreateBookingRequest {
  userId: UuidValueObject;
  resourceId: UuidValueObject;
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
    private readonly paymentService: PaymentService,
    private readonly configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Create a new booking with Redis locking and GIST index validation
   */
  async createBooking(request: CreateBookingRequest): Promise<BookingResult> {
    try {
      // Validate user exists
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found',
          error: 'USER_NOT_FOUND',
        };
      }

      // Validate resource exists
      const resource = await this.resourceRepository.findById(request.resourceId);
      if (!resource) {
        return {
          success: false,
          message: 'Resource not found',
          error: 'RESOURCE_NOT_FOUND',
        };
      }

      // Validate resource item exists
      const resourceItem = await this.resourceItemRepository.findById(request.resourceItemId);
      if (!resourceItem) {
        return {
          success: false,
          message: 'Resource item not found',
          error: 'RESOURCE_ITEM_NOT_FOUND',
        };
      }

      // Validate resource item belongs to resource
      if (!resourceItem.resourceId.equals(request.resourceId)) {
        return {
          success: false,
          message: 'Resource item does not belong to the specified resource',
          error: 'RESOURCE_ITEM_MISMATCH',
        };
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
          resourceId: request.resourceId,
          resourceType: resource.type.value,
          bookingDurationHours: Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60)),
          basePrice: resource.price.value,
          currency: resource.currency || 'USD',
          startDate: request.startDate,
          endDate: request.endDate,
        }, commissionStrategies);

        // Create booking entity
        const booking = BookingEntity.create(
          UuidValueObject.generate(),
          request.userId,
          request.resourceId,
          request.resourceItemId,
          request.startDate,
          request.endDate,
          pricingResult.basePrice,
          pricingResult.commission,
          pricingResult.currency,
          request.notes,
          this.configService.get<number>('BOOKING_PAYMENT_DEADLINE_MINUTES', 10),
          request.metadata
        );

        // Try to save booking directly - GIST index will prevent overlaps
        let savedBooking: BookingEntity;
        try {
          savedBooking = await this.bookingRepository.save(booking);
        } catch (error) {
          // Check if it's an overlap constraint violation
          if (error.code === 'OVERLAP_CONSTRAINT' || error.message?.includes('overlaps')) {
            return {
              success: false,
              message: 'Booking period is already reserved by another user',
              error: 'PERIOD_ALREADY_RESERVED',
            };
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
            resourceId: request.resourceId.value,
            resourceItemId: request.resourceItemId.value,
            startDate: request.startDate.toISOString(),
            endDate: request.endDate.toISOString(),
            totalPrice: savedBooking.price.totalPrice,
            currency: savedBooking.price.currency,
            status: savedBooking.status.value,
          }
        );

        // Send notification to user
        await this.notificationService.createNotification({
          userId: request.userId,
          type: 'BOOKING_CONFIRMATION',
          title: 'Booking Created Successfully',
          message: `Your booking for ${resource.name} has been created. Please complete payment within ${this.configService.get<number>('BOOKING_PAYMENT_DEADLINE_MINUTES', 10)} minutes.`,
          priority: 'HIGH',
          email: user.email.value,
          metadata: {
            bookingId: savedBooking.id.value,
            resourceName: resource.name,
            startDate: request.startDate.toISOString(),
            endDate: request.endDate.toISOString(),
            totalPrice: savedBooking.price.totalPrice,
            currency: savedBooking.price.currency,
            paymentDeadline: savedBooking.paymentDeadline?.toISOString(),
          },
        });

        return {
          success: true,
          message: 'Booking created successfully',
          booking: savedBooking,
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
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND',
        };
      }

      if (!booking.canBeConfirmed()) {
        return {
          success: false,
          message: `Cannot confirm booking with status: ${booking.status.value}`,
          error: 'INVALID_BOOKING_STATUS',
        };
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
    resourceId?: UuidValueObject,
    resourceItemId?: UuidValueObject,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    page?: number,
    limit?: number
  ): Promise<BookingEntity[]> {
    // For now, return all bookings - this should be implemented in repository
    return await this.bookingRepository.findAll();
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
   * Process payment for a booking
   */
  async processBookingPayment(
    bookingId: UuidValueObject,
    paymentMethod: string,
    metadata?: Record<string, any>
  ): Promise<BookingResult> {
    try {
      const booking = await this.bookingRepository.findById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: 'Booking not found',
          error: 'BOOKING_NOT_FOUND',
        };
      }

      if (!booking.isPending()) {
        return {
          success: false,
          message: `Cannot process payment for booking with status: ${booking.status.value}`,
          error: 'INVALID_BOOKING_STATUS',
        };
      }

      // Mark booking as payment pending
      booking.markPaymentPending();
      await this.bookingRepository.save(booking);

      // Process payment through payment service
      const paymentResult = await this.paymentService.processPayment({
        userId: booking.userId,
        resourceId: booking.resourceId,
        resourceType: 'BOOKING', // This should be determined from resource
        basePrice: booking.price.basePrice,
        currency: booking.price.currency,
        bookingDurationHours: booking.period.getDurationInHours(),
        startDate: booking.period.startDate,
        endDate: booking.period.endDate,
        paymentMethod: 'CASH',
        resourceItemId: booking.resourceItemId,
        description: `Payment for booking ${booking.id.value}`,
        metadata: {
          bookingId: booking.id.value,
        },
      });

      if (paymentResult.success) {
        // Confirm booking after successful payment
        return await this.confirmBooking(bookingId);
      } else {
        // Mark payment as failed
        booking.markPaymentFailed();
        await this.bookingRepository.save(booking);

        return {
          success: false,
          message: 'Payment processing failed',
          error: 'PAYMENT_FAILED',
        };
      }

    } catch (error) {
      return {
        success: false,
        message: `Failed to process booking payment: ${error.message}`,
        error: 'PAYMENT_PROCESSING_FAILED',
      };
    }
  }

}
