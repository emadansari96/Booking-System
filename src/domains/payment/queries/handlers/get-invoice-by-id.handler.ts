import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetInvoiceByIdQuery } from '../get-invoice-by-id.query';
import { InvoiceRepositoryInterface } from '../../interfaces/invoice-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetInvoiceByIdQuery)
export class GetInvoiceByIdHandler implements IQueryHandler<GetInvoiceByIdQuery> {
  constructor(
    @Inject('InvoiceRepositoryInterface')
    private readonly invoiceRepository: InvoiceRepositoryInterface,
  ) {}

  async execute(query: GetInvoiceByIdQuery): Promise<any> {
    const invoice = await this.invoiceRepository.findById(UuidValueObject.fromString(query.invoiceId));
    
    if (!invoice) {
      return null;
    }

    return {
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
    };
  }
}
