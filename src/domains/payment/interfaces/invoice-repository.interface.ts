import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { InvoiceEntity } from '../entities/invoice.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
export interface InvoiceSearchCriteria {
  userId?: UuidValueObject;
  status?: string;
  currency?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: Date;
  endDate?: Date;
  dueDateStart?: Date;
  dueDateEnd?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'totalAmount' | 'dueDate' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface InvoiceSearchResult {
  invoices: InvoiceEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface InvoiceRepositoryInterface extends RepositoryInterface<InvoiceEntity> {
  findById(id: UuidValueObject): Promise<InvoiceEntity | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null>;
  findByUserId(userId: UuidValueObject): Promise<InvoiceEntity[]>;
  findByStatus(status: string): Promise<InvoiceEntity[]>;
  findByDateRange(startDate?: Date, endDate?: Date): Promise<InvoiceEntity[]>;
  findByDueDateRange(startDate: Date, endDate: Date): Promise<InvoiceEntity[]>;
  findByAmountRange(minAmount: number, maxAmount: number): Promise<InvoiceEntity[]>;
  findDraftInvoices(): Promise<InvoiceEntity[]>;
  findPendingInvoices(): Promise<InvoiceEntity[]>;
  findPaidInvoices(): Promise<InvoiceEntity[]>;
  findOverdueInvoices(): Promise<InvoiceEntity[]>;
  findCancelledInvoices(): Promise<InvoiceEntity[]>;
  findRefundedInvoices(): Promise<InvoiceEntity[]>;
  search(criteria: InvoiceSearchCriteria): Promise<InvoiceSearchResult>;
  findOverdueInvoices(): Promise<InvoiceEntity[]>;
  findInvoicesByResourceId(resourceId: UuidValueObject): Promise<InvoiceEntity[]>;
  findInvoicesByResourceItemId(resourceItemId: UuidValueObject): Promise<InvoiceEntity[]>;
}
