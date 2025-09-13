import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelBookingCommand } from '../cancel-booking.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CancelBookingCommand)
export class CancelBookingHandler implements ICommandHandler<CancelBookingCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: CancelBookingCommand): Promise<any> {
    const result = await this.bookingService.cancelBooking(
      UuidValueObject.fromString(command.bookingId),
      command.reason
    );

    return result;
  }
}
