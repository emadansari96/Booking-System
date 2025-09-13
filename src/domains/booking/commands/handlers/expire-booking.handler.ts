import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ExpireBookingCommand } from '../expire-booking.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(ExpireBookingCommand)
export class ExpireBookingHandler implements ICommandHandler<ExpireBookingCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: ExpireBookingCommand): Promise<any> {
    const result = await this.bookingService.expireBooking(
      UuidValueObject.fromString(command.bookingId)
    );

    return result;
  }
}
