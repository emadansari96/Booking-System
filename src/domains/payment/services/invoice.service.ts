import { Injectable, Inject } from '@nestjs/common';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { InvoiceEntity } from '../entities/invoice.entity';
import { PaymentEntity } from '../entities/payment.entity';
import { InvoiceRepositoryInterface } from '../interfaces/invoice-repository.interface';
import { PaymentRepositoryInterface } from '../interfaces/payment-repository.interface';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';
import { BookingRepositoryInterface } from '../../booking/interfaces/booking-repository.interface';
import { NotificationService } from '../../notification/services/notification.service';
export interface InvoiceItem {
  resourceId: UuidValueObject;
  resourceItemId?: UuidValueObject;
  description: string;
  quantity: number;
  unitPrice: number;
  metadata?: Record<string, any>;
}

export interface CreateInvoiceRequest {
  userId: UuidValueObject;
  items: InvoiceItem[];
  currency: string;
  dueDate: Date;
  taxRate: number;
  discountAmount: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceResult {
  invoice?: InvoiceEntity;
  payment?: PaymentEntity | null;
  success: boolean;
  message: string;
  error?: string;
}
@Injectable()
export class InvoiceService {
  constructor(
    @Inject('InvoiceRepositoryInterface')
    private readonly invoiceRepository: InvoiceRepositoryInterface,
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
    private readonly auditLogService: AuditLogService,
    @Inject('BookingRepositoryInterface')
    private readonly bookingRepository: BookingRepositoryInterface,
    private readonly notificationService: NotificationService,
  ) {}

  /**
   * Create a new invoice
   */
  async createInvoice(request: CreateInvoiceRequest): Promise<InvoiceResult> {
    try {
      // Calculate totals
      const subtotal = request.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
      const taxAmount = subtotal * request.taxRate;
      const totalAmount = subtotal + taxAmount - request.discountAmount;

      // Create invoice
      const invoice = InvoiceEntity.create(
        UuidValueObject.generate(),
        request.userId,
        request.items.map(item => ({
          resourceId: item.resourceId,
          resourceItemId: item.resourceItemId,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          metadata: item.metadata,
        })),
        request.currency,
        request.dueDate,
        request.taxRate,
        request.discountAmount,
        request.description,
        request.metadata
      );

      // Mark invoice as pending
      invoice.markAsPending();

      // Save invoice
      const savedInvoice = await this.invoiceRepository.save(invoice);

      // Log successful invoice creation
      await this.auditLogService.logEntityCreation(
        request.userId,
        AuditDomain.INVOICE,
        'Invoice',
        savedInvoice.id.value,
        {
          invoiceNumber: savedInvoice.invoiceNumber.value,
          totalAmount: savedInvoice.totalAmount.value,
          currency: savedInvoice.currency.value,
          status: savedInvoice.status.value,
          dueDate: savedInvoice.dueDate.toISOString(),
        }
      );

      return {
        invoice: savedInvoice,
        success: true,
        message: 'Invoice created successfully',
      };
    } catch (error) {
      console.error('Invoice creation failed:', error);
      
      // Log failed invoice creation
      await this.auditLogService.logFailedOperation(
        request.userId,
        AuditDomain.INVOICE,
        'Invoice',
        'unknown',
        AuditAction.CREATE,
        error.message,
        AuditStatus.FAILED,
        AuditSeverity.HIGH
      );

      return {
        invoice: null as any,
        success: false,
        message: `Invoice creation failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Pay an invoice
   */
  async payInvoice(invoiceId: UuidValueObject, paymentMethod: string, paidBy?: UuidValueObject): Promise<InvoiceResult> {
    try {
      const invoice = await this.invoiceRepository.findById(invoiceId);
      if (!invoice) {
        throw new Error(`Invoice with id ${invoiceId.value} not found`);
      }

      if (invoice.isPaid()) {
        throw new Error('Invoice is already paid');
      }

      if (invoice.isOverdue()) {
        throw new Error('Invoice is overdue');
      }

      // Mark invoice as paid
      invoice.markAsPaid();
      const savedInvoice = await this.invoiceRepository.save(invoice);

      // Create payment record
      const payment = PaymentEntity.create(
        UuidValueObject.generate(),
        invoice.userId,
        invoice.id,
        paymentMethod,
        invoice.totalAmount.value,
        invoice.currency.value,
        `Payment for invoice ${invoice.invoiceNumber.value}`,
        undefined, // reference
        {
          invoiceId: invoice.id.value,
          invoiceNumber: invoice.invoiceNumber.value,
          paidBy: paidBy?.value || invoice.userId.value,
          paidAt: new Date().toISOString(),
        }
      );

      // Approve and complete payment
      payment.approve(paidBy || invoice.userId);
      payment.complete();
      const savedPayment = await this.paymentRepository.save(payment);

      // Update booking status if invoice has booking reference
      if (invoice.metadata?.bookingId) {
        try {
          const bookingId = UuidValueObject.fromString(invoice.metadata.bookingId);
          const booking = await this.bookingRepository.findById(bookingId);
          
          if (booking && booking.isPending()) {
            booking.confirm();
            await this.bookingRepository.save(booking);
            // Send booking confirmation notification
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
                invoiceId: invoice.id.value,
                paymentAmount: invoice.totalAmount.value,
                currency: invoice.currency.value,
              },
            });
          }
        } catch (bookingError) {
          console.error('Failed to confirm booking after payment:', bookingError);
        }
      }

      // Log successful payment creation
      await this.auditLogService.logEntityCreation(
        paidBy || invoice.userId,
        AuditDomain.PAYMENT,
        'Payment',
        savedPayment.id.value,
        {
          invoiceId: savedInvoice.id.value,
          amount: savedPayment.amount.value,
          currency: savedPayment.currency.value,
          paymentMethod: savedPayment.method.value,
          status: savedPayment.status.value,
        }
      );

      // Log successful invoice payment
      await this.auditLogService.logEntityUpdate(
        paidBy || invoice.userId,
        AuditDomain.INVOICE,
        'Invoice Payment',
        savedInvoice.id.value,
        {
          status: 'PENDING',
          paidAt: null,
        },
        {
          invoiceNumber: savedInvoice.invoiceNumber.value,
          totalAmount: savedInvoice.totalAmount.value,
          currency: savedInvoice.currency.value,
          status: savedInvoice.status.value,
          paidAt: savedInvoice.paidAt?.toISOString(),
          paymentId: savedPayment.id.value,
        }
      );

      return {
        invoice: savedInvoice,
        payment: savedPayment,
        success: true,
        message: 'Invoice paid successfully',
      };
    } catch (error) {
      console.error('Invoice payment failed:', error);
      
      return {
        invoice: null as any,
        success: false,
        message: `Invoice payment failed: ${error.message}`,
        error: error.message,
      };
    }
  }

  /**
   * Cancel an invoice
   */
  async cancelInvoice(invoiceId: UuidValueObject, cancelledBy: UuidValueObject, reason?: string): Promise<InvoiceResult> {
    try {
      const invoice = await this.invoiceRepository.findById(invoiceId);
      if (!invoice) {
        throw new Error(`Invoice with id ${invoiceId.value} not found`);
      }

      if (invoice.isPaid()) {
        throw new Error('Cannot cancel paid invoice');
      }

      // Cancel invoice
      invoice.cancel();
      const savedInvoice = await this.invoiceRepository.save(invoice);

      // Log cancellation
      await this.auditLogService.logEntityUpdate(
        cancelledBy,
        AuditDomain.INVOICE,
        'Invoice Cancellation',
        savedInvoice.id.value,
        {
          status: 'PENDING',
          cancelledAt: null,
        },
        {
          invoiceNumber: savedInvoice.invoiceNumber.value,
          status: savedInvoice.status.value,
          cancelledAt: savedInvoice.cancelledAt?.toISOString(),
          reason: reason,
        }
      );

      return {
        invoice: savedInvoice,
        success: true,
        message: 'Invoice cancelled successfully',
      };
    } catch (error) {
      console.error('Invoice cancellation failed:', error);
      
      return {
        invoice: null as any,
        success: false,
        message: `Invoice cancellation failed: ${error.message}`,
        error: error.message,
      };
    }
  }
}
