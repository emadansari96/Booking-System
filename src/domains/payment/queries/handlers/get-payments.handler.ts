import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPaymentsQuery } from '../get-payments.query';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@QueryHandler(GetPaymentsQuery)
export class GetPaymentsHandler implements IQueryHandler<GetPaymentsQuery> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(query: GetPaymentsQuery): Promise<any> {
    const result = await this.paymentService.getPayments(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.status as any,
      query.page,
      query.limit
    );

    return result;
  }
}