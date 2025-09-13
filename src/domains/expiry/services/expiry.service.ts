import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceRepositoryInterface } from '../../payment/interfaces/invoice-repository.interface';
import { BookingRepositoryInterface } from '../../booking/interfaces/booking-repository.interface';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';
import { NotificationService } from '../../notification/services/notification.service';
@Injectable()
export class ExpiryService {
  constructor(
    @Inject('InvoiceRepositoryInterface')
    private readonly invoiceRepository: InvoiceRepositoryInterface,
    @Inject('BookingRepositoryInterface')
    private readonly bookingRepository: BookingRepositoryInterface,
    private readonly auditLogService: AuditLogService,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Run every minute to check for expired invoices and bookings
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async handleExpiredItems(): Promise<void> {
    console.log('Checking for expired invoices and bookings...');
    
    try {
      await this.expireOverdueInvoices();
      await this.expireOverdueBookings();
    } catch (error) {
      console.error('Error processing expired items:', error);
    }
  }

  /**
   * Find and expire overdue invoices
   */
  private async expireOverdueInvoices(): Promise<void> {
    try {
      // Get all pending invoices that are overdue
      const overdueInvoices = await this.invoiceRepository.findOverdueInvoices();
      
      for (const invoice of overdueInvoices) {
        try {
          // Mark invoice as overdue
          invoice.markAsOverdue();
          await this.invoiceRepository.save(invoice);

          // Cancel associated booking if exists
          if (invoice.metadata?.bookingId) {
            await this.cancelAssociatedBooking(invoice.metadata.bookingId);
          }

          // Log expiry
          await this.auditLogService.logEntityUpdate(
            invoice.userId,
            AuditDomain.INVOICE,
            'Invoice Expiry',
            invoice.id.value,
            {
              status: 'PENDING',
            },
            {
              invoiceNumber: invoice.invoiceNumber.value,
              status: invoice.status.value,
              expiredAt: new Date().toISOString(),
            }
          );

          console.log(`Invoice ${invoice.invoiceNumber.value} expired`);
        } catch (error) {
          console.error(`Failed to expire invoice ${invoice.id.value}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing overdue invoices:', error);
    }
  }

  /**
   * Find and expire overdue bookings
   */
  private async expireOverdueBookings(): Promise<void> {
    try {
      // Get all pending bookings that are overdue (older than 5 minutes)
      const overdueBookings = await this.bookingRepository.findOverdueBookings();
      
      for (const booking of overdueBookings) {
        try {
          // Mark booking as expired
          booking.expire();
          await this.bookingRepository.save(booking);

          // Send expiry notification
          await this.notificationService.createNotification({
            userId: booking.userId,
            type: 'BOOKING_EXPIRED',
            title: 'Booking Expired',
            message: 'Your booking has expired due to non-payment. The reservation has been cancelled.',
            priority: 'HIGH',
            metadata: {
              bookingId: booking.id.value,
              startDate: booking.period.startDate.toISOString(),
              endDate: booking.period.endDate.toISOString(),
              expiredAt: new Date().toISOString(),
            },
          });

          // Cancel associated invoice if exists
          if (booking.metadata?.invoiceId) {
            await this.cancelAssociatedInvoice(booking.metadata.invoiceId);
          }

          // Log expiry
          await this.auditLogService.logEntityUpdate(
            booking.userId,
            AuditDomain.BOOKING,
            'Booking Expiry',
            booking.id.value,
            {
              status: 'PENDING',
            },
            {
              bookingId: booking.id.value,
              status: booking.status.value,
              expiredAt: new Date().toISOString(),
            }
          );

          console.log(`Booking ${booking.id.value} expired`);
        } catch (error) {
          console.error(`Failed to expire booking ${booking.id.value}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing overdue bookings:', error);
    }
  }

  /**
   * Cancel associated booking when invoice expires
   */
  private async cancelAssociatedBooking(bookingId: string): Promise<void> {
    try {
      const booking = await this.bookingRepository.findById(UuidValueObject.fromString(bookingId));
      if (booking && booking.isPending()) {
        booking.cancel();
        await this.bookingRepository.save(booking);
        console.log(`Associated booking ${bookingId} cancelled due to invoice expiry`);
      }
    } catch (error) {
      console.error(`Failed to cancel associated booking ${bookingId}:`, error);
    }
  }

  /**
   * Cancel associated invoice when booking expires
   */
  private async cancelAssociatedInvoice(invoiceId: string): Promise<void> {
    try {
      const invoice = await this.invoiceRepository.findById(UuidValueObject.fromString(invoiceId));
      if (invoice && invoice.isPending()) {
        invoice.cancel();
        await this.invoiceRepository.save(invoice);
        console.log(`Associated invoice ${invoiceId} cancelled due to booking expiry`);
      }
    } catch (error) {
      console.error(`Failed to cancel associated invoice ${invoiceId}:`, error);
    }
  }
}
