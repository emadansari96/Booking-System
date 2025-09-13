import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FailPaymentCommand } from '../fail-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(FailPaymentCommand)
export class FailPaymentHandler implements ICommandHandler<FailPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: FailPaymentCommand): Promise<any> {
    const result = await this.paymentService.failPayment(
      UuidValueObject.fromString(command.paymentId),
      command.reason
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      status: result.payment.status.value,
      failedAt: result.payment.failedAt,
      failureReason: result.payment.failureReason,
      message: result.message,
    };
  }
}
