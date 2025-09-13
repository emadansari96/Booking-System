import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentSummaryQuery } from '../get-payment-summary.query';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetPaymentSummaryQuery)
export class GetPaymentSummaryHandler implements IQueryHandler<GetPaymentSummaryQuery> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(query: GetPaymentSummaryQuery): Promise<any> {
    return await this.paymentService.getPaymentSummary(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.startDate,
      query.endDate,
      query.status
    );
  }
}
