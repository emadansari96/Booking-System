import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { PaymentEntity } from '../entities/payment.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface PaymentSearchCriteria {
  userId?: UuidValueObject;
  invoiceId?: UuidValueObject;
  status?: string;
  method?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaymentSearchResult {
  payments: PaymentEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface PaymentRepositoryInterface extends RepositoryInterface<PaymentEntity> {
  findById(id: UuidValueObject): Promise<PaymentEntity | null>;
  findByUserId(userId: UuidValueObject): Promise<PaymentEntity[]>;
  findByInvoiceId(invoiceId: UuidValueObject): Promise<PaymentEntity[]>;
  findByStatus(status: string): Promise<PaymentEntity[]>;
  findByMethod(method: string): Promise<PaymentEntity[]>;
  findByDateRange(startDate?: Date, endDate?: Date): Promise<PaymentEntity[]>;
  findByAmountRange(minAmount: number, maxAmount: number): Promise<PaymentEntity[]>;
  findPendingPayments(): Promise<PaymentEntity[]>;
  findApprovedPayments(): Promise<PaymentEntity[]>;
  findCompletedPayments(): Promise<PaymentEntity[]>;
  findFailedPayments(): Promise<PaymentEntity[]>;
  findCancelledPayments(): Promise<PaymentEntity[]>;
  findRefundedPayments(): Promise<PaymentEntity[]>;
  search(criteria: PaymentSearchCriteria): Promise<PaymentSearchResult>;
  findByReference(reference: string): Promise<PaymentEntity | null>;
  findPaymentsRequiringApproval(): Promise<PaymentEntity[]>;
}
