import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PayInvoiceCommand } from '../pay-invoice.command';
import { InvoiceService } from '../../services/invoice.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(PayInvoiceCommand)
export class PayInvoiceHandler implements ICommandHandler<PayInvoiceCommand> {
  constructor(
    private readonly invoiceService: InvoiceService,
  ) {}

  async execute(command: PayInvoiceCommand): Promise<any> {
    const result = await this.invoiceService.payInvoice(
      UuidValueObject.fromString(command.invoiceId),
      command.paymentMethod,
      UuidValueObject.fromString(command.paidBy)
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  }
}


