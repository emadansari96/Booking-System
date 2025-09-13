import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfirmBookingCommand } from '../confirm-booking.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(ConfirmBookingCommand)
export class ConfirmBookingHandler implements ICommandHandler<ConfirmBookingCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: ConfirmBookingCommand): Promise<any> {
    const result = await this.bookingService.confirmBooking(
      UuidValueObject.fromString(command.bookingId)
    );

    return result;
  }
}
