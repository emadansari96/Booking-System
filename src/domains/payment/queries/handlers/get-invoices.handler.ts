import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetInvoicesQuery } from '../get-invoices.query';
import { InvoiceRepositoryInterface } from '../../interfaces/invoice-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetInvoicesQuery)
export class GetInvoicesHandler implements IQueryHandler<GetInvoicesQuery> {
  constructor(
    @Inject('InvoiceRepositoryInterface')
    private readonly invoiceRepository: InvoiceRepositoryInterface,
  ) {}

  async execute(query: GetInvoicesQuery): Promise<any> {
    const criteria = {
      userId: query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      status: query.status,
      currency: query.currency,
      startDate: query.startDate,
      endDate: query.endDate,
      dueDateStart: query.dueDateStart,
      dueDateEnd: query.dueDateEnd,
      page: query.page,
      limit: query.limit,
    };

    const result = await this.invoiceRepository.search(criteria);

    return {
      invoices: result.invoices.map(invoice => ({
        id: invoice.id.value,
        invoiceNumber: invoice.invoiceNumber.value,
        userId: invoice.userId.value,
        status: invoice.status.value,
        items: invoice.items.map(item => ({
          id: item.id.value,
          resourceId: item.resourceId.value,
          resourceItemId: item.resourceItemId?.value,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice.value,
          totalPrice: item.totalPrice.value,
          metadata: item.metadata,
        })),
        subtotal: invoice.subtotal.value,
        taxAmount: invoice.taxAmount.value,
        discountAmount: invoice.discountAmount.value,
        totalAmount: invoice.totalAmount.value,
        currency: invoice.currency.value,
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        cancelledAt: invoice.cancelledAt,
        refundedAt: invoice.refundedAt,
        notes: invoice.notes,
        metadata: invoice.metadata,
        createdAt: invoice.createdAt,
        updatedAt: invoice.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
