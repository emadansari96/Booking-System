import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessPaymentCommand } from '../process-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(ProcessPaymentCommand)
export class ProcessPaymentHandler implements ICommandHandler<ProcessPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: ProcessPaymentCommand): Promise<any> {
    const result = await this.paymentService.processPayment({
      userId: UuidValueObject.fromString(command.userId),
      resourceId: UuidValueObject.fromString(command.resourceId),
      resourceItemId: command.resourceItemId ? UuidValueObject.fromString(command.resourceItemId) : undefined,
      resourceType: command.resourceType,
      basePrice: command.basePrice,
      currency: command.currency,
      bookingDurationHours: command.bookingDurationHours,
      startDate: command.startDate,
      endDate: command.endDate,
      paymentMethod: command.paymentMethod,
      description: command.description,
      metadata: command.metadata,
    });

    if (!result.success) {
      throw new Error(result.message);
    }

    return {
      paymentId: result.payment.id.value,
      invoiceId: result.invoice.id.value,
      invoiceNumber: result.invoice.invoiceNumber.value,
      amount: result.payment.amount.value,
      currency: result.payment.currency.value,
      status: result.payment.status.value,
      message: result.message,
    };
  }
}
