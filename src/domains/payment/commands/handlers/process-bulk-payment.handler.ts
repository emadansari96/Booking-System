import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessBulkPaymentCommand } from '../process-bulk-payment.command';
import { PaymentService } from '../../services/payment.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(ProcessBulkPaymentCommand)
export class ProcessBulkPaymentHandler implements ICommandHandler<ProcessBulkPaymentCommand> {
  constructor(
    private readonly paymentService: PaymentService,
  ) {}

  async execute(command: ProcessBulkPaymentCommand): Promise<any> {
    const result = await this.paymentService.processBulkPayment({
      userId: UuidValueObject.fromString(command.userId),
      items: command.items.map(item => ({
        resourceId: UuidValueObject.fromString(item.resourceId),
        resourceItemId: item.resourceItemId ? UuidValueObject.fromString(item.resourceItemId) : undefined,
        resourceType: item.resourceType,
        basePrice: item.basePrice,
        bookingDurationHours: item.bookingDurationHours,
        startDate: item.startDate,
        endDate: item.endDate,
        description: item.description,
        metadata: item.metadata,
      })),
      currency: command.currency,
      paymentMethod: command.paymentMethod,
      dueDate: command.dueDate,
      taxRate: command.taxRate,
      discountAmount: command.discountAmount,
      notes: command.notes,
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
