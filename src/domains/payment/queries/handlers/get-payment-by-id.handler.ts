import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentByIdQuery } from '../get-payment-by-id.query';
import { PaymentRepositoryInterface } from '../../interfaces/payment-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetPaymentByIdQuery)
export class GetPaymentByIdHandler implements IQueryHandler<GetPaymentByIdQuery> {
  constructor(
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
  ) {}

  async execute(query: GetPaymentByIdQuery): Promise<any> {
    const payment = await this.paymentRepository.findById(UuidValueObject.fromString(query.paymentId));
    
    if (!payment) {
      return null;
    }

    return {
      id: payment.id.value,
      userId: payment.userId.value,
      invoiceId: payment.invoiceId.value,
      method: payment.method.value,
      status: payment.status.value,
      amount: payment.amount.value,
      currency: payment.currency.value,
      description: payment.description,
      reference: payment.reference,
      metadata: payment.metadata,
      approvedBy: payment.approvedBy?.value,
      approvedAt: payment.approvedAt,
      completedAt: payment.completedAt,
      failedAt: payment.failedAt,
      cancelledAt: payment.cancelledAt,
      refundedAt: payment.refundedAt,
      failureReason: payment.failureReason,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
