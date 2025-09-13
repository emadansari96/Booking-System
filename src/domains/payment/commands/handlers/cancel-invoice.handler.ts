import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelInvoiceCommand } from '../cancel-invoice.command';
import { InvoiceService } from '../../services/invoice.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CancelInvoiceCommand)
export class CancelInvoiceHandler implements ICommandHandler<CancelInvoiceCommand> {
  constructor(
    private readonly invoiceService: InvoiceService,
  ) {}

  async execute(command: CancelInvoiceCommand): Promise<any> {
    const result = await this.invoiceService.cancelInvoice(
      UuidValueObject.fromString(command.invoiceId),
      UuidValueObject.fromString(command.cancelledBy),
      command.reason
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    return result;
  }
}


