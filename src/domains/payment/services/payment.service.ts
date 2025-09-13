import { Injectable, Inject } from '@nestjs/common';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { PaymentEntity } from '../entities/payment.entity';
import { InvoiceEntity } from '../entities/invoice.entity';
import { PaymentRepositoryInterface } from '../interfaces/payment-repository.interface';
import { InvoiceRepositoryInterface } from '../interfaces/invoice-repository.interface';
import { PricingService } from '../../pricing/services/pricing.service';
import { CommissionStrategyRepositoryInterface } from '../../pricing/interfaces/commission-strategy-repository.interface';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';
export interface PaymentRequest {
  userId: UuidValueObject;
  resourceId: UuidValueObject;
  resourceItemId?: UuidValueObject;
  resourceType: string;
  basePrice: number;
  currency: string;
  bookingDurationHours: number;
  startDate: Date;
  endDate: Date;
  paymentMethod: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface PaymentResult {
  payment?: PaymentEntity;
  invoice?: InvoiceEntity;
  success: boolean;
  message: string;
  error?: string;
}

export interface BulkPaymentRequest {
  userId: UuidValueObject;
  items: Array<{
    resourceId: UuidValueObject;
    resourceItemId?: UuidValueObject;
    resourceType: string;
    basePrice: number;
    bookingDurationHours: number;
    startDate: Date;
    endDate: Date;
    description?: string;
    metadata?: Record<string, any>;
  }>;
  currency: string;
  paymentMethod: string;
  dueDate: Date;
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  metadata?: Record<string, any>;
}

export interface BulkPaymentResult {
  payment: PaymentEntity;
  invoice: InvoiceEntity;
  success: boolean;
  message: string;
}
@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
    @Inject('InvoiceRepositoryInterface')
    private readonly invoiceRepository: InvoiceRepositoryInterface,
    private readonly pricingService: PricingService,
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
    private readonly auditLogService: AuditLogService,
  ) {}

  /**
   * Process a single payment with automatic invoice generation
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // Get commission strategies for pricing calculation
      const commissionStrategies = await this.commissionStrategyRepository.findActiveStrategies();
      
      console.log('Commission strategies found:', commissionStrategies.length);
      console.log('Resource type:', request.resourceType);
      console.log('Base price:', request.basePrice);

      // Calculate pricing
      const pricingResult = this.pricingService.calculatePricing({
        resourceId: request.resourceId,
        resourceType: request.resourceType,
        basePrice: request.basePrice,
        currency: request.currency,
        bookingDurationHours: request.bookingDurationHours,
        startDate: request.startDate,
        endDate: request.endDate,
      }, commissionStrategies);
      
      console.log('Pricing result:', pricingResult);

      // Create invoice
      const invoice = InvoiceEntity.create(
        UuidValueObject.generate(),
        request.userId,
        [{
          resourceId: request.resourceId,
          resourceItemId: request.resourceItemId,
          description: request.description || `Booking for ${request.resourceType}`,
          quantity: 1,
          unitPrice: pricingResult.totalPrice,
          metadata: request.metadata,
        }],
        request.currency,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        0, // tax rate
        0, // discount amount
        request.description,
        request.metadata
      );

      // Mark invoice as pending
      invoice.markAsPending();

      // Create payment
      const payment = PaymentEntity.create(
        UuidValueObject.generate(),
        request.userId,
        invoice.id,
        request.paymentMethod,
        pricingResult.totalPrice,
        request.currency,
        request.description,
        undefined, // reference
        request.metadata
      );

      // Save invoice and payment
      console.log('Saving invoice...');
      const savedInvoice = await this.invoiceRepository.save(invoice);
      console.log('Invoice saved:', savedInvoice.id.value);
      
      console.log('Saving payment...');
      const savedPayment = await this.paymentRepository.save(payment);
      console.log('Payment saved:', savedPayment.id.value);

      // Log successful payment creation
      await this.auditLogService.logEntityCreation(
        request.userId,
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

      // Log successful invoice creation
      await this.auditLogService.logEntityCreation(
        request.userId,
        AuditDomain.INVOICE,
        'Invoice',
        savedInvoice.id.value,
        {
          paymentId: savedPayment.id.value,
          totalAmount: savedInvoice.totalAmount,
          currency: savedInvoice.currency,
          status: savedInvoice.status.value,
          dueDate: savedInvoice.dueDate.toISOString(),
        }
      );

      return {
        payment: savedPayment,
        invoice: savedInvoice,
        success: true,
        message: 'Payment processed successfully',
      };
    } catch (error) {
      console.error('Payment processing failed:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Log failed payment
      await this.auditLogService.logFailedOperation(
        request.userId,
        AuditDomain.PAYMENT,
        'Payment',
        'unknown',
        AuditAction.PAYMENT,
        error.message
      );

      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Payment processing failed: ${error.message}`,
      };
    }
  }

  /**
   * Process bulk payment for multiple items in a single invoice
   */
  async processBulkPayment(request: BulkPaymentRequest): Promise<BulkPaymentResult> {
    try {
      // Get commission strategies for pricing calculation
      const commissionStrategies = await this.commissionStrategyRepository.findActiveStrategies();

      // Calculate pricing for all items
      const pricingResults = request.items.map(item => 
        this.pricingService.calculatePricing({
          resourceId: item.resourceId,
          resourceType: item.resourceType,
          basePrice: item.basePrice,
          currency: request.currency,
          bookingDurationHours: item.bookingDurationHours,
          startDate: item.startDate,
          endDate: item.endDate,
        }, commissionStrategies)
      );

      // Create invoice items
      const invoiceItems = request.items.map((item, index) => ({
        resourceId: item.resourceId,
        resourceItemId: item.resourceItemId,
        description: item.description || `Booking for ${item.resourceType}`,
        quantity: 1,
        unitPrice: pricingResults[index].totalPrice,
        metadata: item.metadata,
      }));

      // Create invoice
      const invoice = InvoiceEntity.create(
        UuidValueObject.generate(),
        request.userId,
        invoiceItems,
        request.currency,
        request.dueDate,
        request.taxRate || 0,
        request.discountAmount || 0,
        request.notes,
        request.metadata
      );

      // Mark invoice as pending
      invoice.markAsPending();

      // Create payment for total amount
      const payment = PaymentEntity.create(
        UuidValueObject.generate(),
        request.userId,
        invoice.id,
        request.paymentMethod,
        invoice.totalAmount.value,
        request.currency,
        request.notes,
        undefined, // reference
        request.metadata
      );

      // Save invoice and payment
      const savedInvoice = await this.invoiceRepository.save(invoice);
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        payment: savedPayment,
        invoice: savedInvoice,
        success: true,
        message: 'Bulk payment processed successfully',
      };
    } catch (error) {
      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Bulk payment processing failed: ${error.message}`,
      };
    }
  }

  /**
   * Complete a payment
   */
  async completePayment(paymentId: UuidValueObject): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment with id ${paymentId.value} not found`);
      }

      if (!payment.isApproved()) {
        throw new Error(`Cannot complete payment with status: ${payment.status.value}`);
      }

      // Complete payment
      payment.complete();

      // Mark invoice as paid
      const invoice = await this.invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        invoice.markAsPaid();
        await this.invoiceRepository.save(invoice);
      }

      // Save updated payment
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        payment: savedPayment,
        invoice: invoice || null as any,
        success: true,
        message: 'Payment completed successfully',
      };
    } catch (error) {
      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Payment completion failed: ${error.message}`,
      };
    }
  }

  /**
   * Fail a payment
   */
  async failPayment(paymentId: UuidValueObject, reason: string): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment with id ${paymentId.value} not found`);
      }

      if (payment.isCompleted() || payment.isFailed() || payment.isCancelled()) {
        throw new Error(`Cannot fail payment with status: ${payment.status.value}`);
      }

      // Fail payment
      payment.fail(reason);

      // Save updated payment
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        payment: savedPayment,
        invoice: null as any,
        success: true,
        message: 'Payment failed successfully',
      };
    } catch (error) {
      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Payment failure processing failed: ${error.message}`,
      };
    }
  }

  /**
   * Cancel a payment
   */
  async cancelPayment(paymentId: UuidValueObject): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment with id ${paymentId.value} not found`);
      }

      if (payment.isCompleted() || payment.isFailed() || payment.isCancelled()) {
        throw new Error(`Cannot cancel payment with status: ${payment.status.value}`);
      }

      // Cancel payment
      payment.cancel();

      // Cancel invoice
      const invoice = await this.invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        invoice.cancel();
        await this.invoiceRepository.save(invoice);
      }

      // Save updated payment
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        payment: savedPayment,
        invoice: invoice || null as any,
        success: true,
        message: 'Payment cancelled successfully',
      };
    } catch (error) {
      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Payment cancellation failed: ${error.message}`,
      };
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(paymentId: UuidValueObject): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error(`Payment with id ${paymentId.value} not found`);
      }

      if (!payment.isCompleted()) {
        throw new Error(`Cannot refund payment with status: ${payment.status.value}`);
      }

      // Refund payment
      payment.refund();

      // Refund invoice
      const invoice = await this.invoiceRepository.findById(payment.invoiceId);
      if (invoice) {
        invoice.refund();
        await this.invoiceRepository.save(invoice);
      }

      // Save updated payment
      const savedPayment = await this.paymentRepository.save(payment);

      return {
        payment: savedPayment,
        invoice: invoice || null as any,
        success: true,
        message: 'Payment refunded successfully',
      };
    } catch (error) {
      return {
        payment: null as any,
        invoice: null as any,
        success: false,
        message: `Payment refund failed: ${error.message}`,
      };
    }
  }

  /**
   * Get payment summary for reporting
   */
  async getPaymentSummary(
    userId?: UuidValueObject,
    startDate?: Date,
    endDate?: Date,
    status?: string
  ): Promise<{
    totalPayments: number;
    totalAmount: number;
    completedPayments: number;
    pendingPayments: number;
    failedPayments: number;
    cancelledPayments: number;
    refundedPayments: number;
  }> {
    const payments = await this.paymentRepository.findByDateRange(startDate, endDate);
    
    let filteredPayments = payments;
    if (userId) {
      filteredPayments = payments.filter(p => p.userId.equals(userId));
    }
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status.value === status);
    }

    const totalPayments = filteredPayments.length;
    const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount.value, 0);
    const completedPayments = filteredPayments.filter(p => p.isCompleted()).length;
    const pendingPayments = filteredPayments.filter(p => p.isPending()).length;
    const failedPayments = filteredPayments.filter(p => p.isFailed()).length;
    const cancelledPayments = filteredPayments.filter(p => p.isCancelled()).length;
    const refundedPayments = filteredPayments.filter(p => p.isRefunded()).length;

    return {
      totalPayments,
      totalAmount,
      completedPayments,
      pendingPayments,
      failedPayments,
      cancelledPayments,
      refundedPayments,
    };
  }

  /**
   * Get payments with filters
   */
  async getPayments(
    userId?: UuidValueObject,
    status?: string,
    page?: number,
    limit?: number
  ): Promise<any> {
    const payments = await this.paymentRepository.findAll();
    
    let filteredPayments = payments;
    
    if (userId) {
      filteredPayments = payments.filter(p => p.userId.equals(userId));
    }
    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status.value === status);
    }

    const total = filteredPayments.length;
    const startIndex = page ? (page - 1) * (limit || 10) : 0;
    const endIndex = limit ? startIndex + limit : total;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    return {
      payments: paginatedPayments,
      total,
      page: page || 1,
      limit: limit || 10,
    };
  }

  /**
   * Approve a payment (Admin only)
   */
  async approvePayment(paymentId: UuidValueObject, approvedBy: UuidValueObject): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      if (!payment.status.isNeedToPay()) {
        return {
          success: false,
          message: `Cannot approve payment with status: ${payment.status.value}`,
          error: 'INVALID_PAYMENT_STATUS',
        };
      }

      // Approve the payment
      payment.approve(approvedBy);
      const savedPayment = await this.paymentRepository.save(payment);

      // Complete the payment to trigger booking confirmation
      payment.complete();
      const completedPayment = await this.paymentRepository.save(payment);

      // Log successful payment approval
      await this.auditLogService.logEntityUpdate(
        approvedBy,
        AuditDomain.PAYMENT,
        'Payment',
        completedPayment.id.value,
        { status: 'NEED_TO_PAY' }, // oldValues
        {
          status: completedPayment.status.value,
          approvedBy: approvedBy.value,
          approvedAt: completedPayment.approvedAt?.toISOString(),
          completedAt: completedPayment.completedAt?.toISOString(),
        } // newValues
      );

      return {
        success: true,
        message: 'Payment approved and completed successfully',
        payment: completedPayment,
        invoice: null as any,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to approve payment: ${error.message}`,
        error: 'PAYMENT_APPROVAL_FAILED',
      };
    }
  }

  /**
   * Reject a payment (Admin only)
   */
  async rejectPayment(paymentId: UuidValueObject, rejectedBy: UuidValueObject, reason?: string): Promise<PaymentResult> {
    try {
      const payment = await this.paymentRepository.findById(paymentId);
      if (!payment) {
        return {
          success: false,
          message: 'Payment not found',
          error: 'PAYMENT_NOT_FOUND',
        };
      }

      if (!payment.status.isNeedToPay()) {
        return {
          success: false,
          message: `Cannot reject payment with status: ${payment.status.value}`,
          error: 'INVALID_PAYMENT_STATUS',
        };
      }

      // Reject the payment
      payment.fail(reason || 'Payment rejected by admin');
      const savedPayment = await this.paymentRepository.save(payment);

      // Log successful payment rejection
      await this.auditLogService.logEntityUpdate(
        rejectedBy,
        AuditDomain.PAYMENT,
        'Payment',
        savedPayment.id.value,
        { status: 'NEED_TO_PAY' }, // oldValues
        {
          status: savedPayment.status.value,
          rejectedBy: rejectedBy.value,
          rejectedAt: savedPayment.failedAt?.toISOString(),
          reason: reason || 'Payment rejected by admin',
        } // newValues
      );

      return {
        success: true,
        message: 'Payment rejected successfully',
        payment: savedPayment,
        invoice: null as any,
      };

    } catch (error) {
      return {
        success: false,
        message: `Failed to reject payment: ${error.message}`,
        error: 'PAYMENT_REJECTION_FAILED',
      };
    }
  }
}
