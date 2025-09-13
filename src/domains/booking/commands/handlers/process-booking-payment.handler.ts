import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProcessBookingPaymentCommand } from '../process-booking-payment.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(ProcessBookingPaymentCommand)
export class ProcessBookingPaymentHandler implements ICommandHandler<ProcessBookingPaymentCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: ProcessBookingPaymentCommand): Promise<any> {
    const result = await this.bookingService.processBookingPayment(
      UuidValueObject.fromString(command.bookingId),
      command.paymentMethod,
      command.metadata
    );

    return result;
  }
}
