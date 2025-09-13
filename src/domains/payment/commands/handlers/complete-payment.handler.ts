import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompletePaymentCommand } from '../complete-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(CompletePaymentCommand)
export class CompletePaymentHandler implements ICommandHandler<CompletePaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: CompletePaymentCommand): Promise<any> {
    const result = await this.paymentService.completePayment(
      UuidValueObject.fromString(command.paymentId)
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      status: result.payment.status.value,
      completedAt: result.payment.completedAt,
      message: result.message,
    };
  }
}
