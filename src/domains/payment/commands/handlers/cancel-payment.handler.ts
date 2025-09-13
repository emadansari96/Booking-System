import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelPaymentCommand } from '../cancel-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(CancelPaymentCommand)
export class CancelPaymentHandler implements ICommandHandler<CancelPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: CancelPaymentCommand): Promise<any> {
    const result = await this.paymentService.cancelPayment(
      UuidValueObject.fromString(command.paymentId)
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      status: result.payment.status.value,
      cancelledAt: result.payment.cancelledAt,
      message: result.message,
    };
  }
}
