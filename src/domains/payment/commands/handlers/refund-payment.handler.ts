import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RefundPaymentCommand } from '../refund-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(RefundPaymentCommand)
export class RefundPaymentHandler implements ICommandHandler<RefundPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: RefundPaymentCommand): Promise<any> {
    const result = await this.paymentService.refundPayment(
      UuidValueObject.fromString(command.paymentId)
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      status: result.payment.status.value,
      refundedAt: result.payment.refundedAt,
      message: result.message,
    };
  }
}
