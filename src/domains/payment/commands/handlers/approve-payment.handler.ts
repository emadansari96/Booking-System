import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApprovePaymentCommand } from '../approve-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(ApprovePaymentCommand)
export class ApprovePaymentHandler implements ICommandHandler<ApprovePaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: ApprovePaymentCommand): Promise<any> {
    const result = await this.paymentService.approvePayment(
      UuidValueObject.fromString(command.paymentId),
      UuidValueObject.fromString(command.approvedBy)
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      status: result.payment.status.value,
      approvedBy: result.payment.approvedBy?.value,
      approvedAt: result.payment.approvedAt,
      message: result.message,
    };
  }
}
