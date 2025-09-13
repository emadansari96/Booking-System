import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RejectPaymentCommand } from '../reject-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(RejectPaymentCommand)
export class RejectPaymentHandler implements ICommandHandler<RejectPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: RejectPaymentCommand): Promise<any> {
    const result = await this.paymentService.rejectPayment(
      UuidValueObject.fromString(command.paymentId),
      UuidValueObject.fromString(command.rejectedBy),
      command.reason
    );

    if (result.success) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to reject payment');
    }
  }
}


