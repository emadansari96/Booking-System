import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPaymentsQuery } from '../get-payments.query';
import { PaymentRepositoryInterface } from '../../interfaces/payment-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(
    @Inject('PaymentRepositoryInterface')
    private readonly paymentRepository: PaymentRepositoryInterface,
  ) {}

  async execute(query: GetPaymentsQuery): Promise<any> {
    const criteria = {
      userId: query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      status: query.status,
      method: query.method,
      currency: query.currency,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page,
      limit: query.limit,
    };

    const result = await this.paymentRepository.search(criteria);

    return {
      payments: result.payments.map(payment => ({
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
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
