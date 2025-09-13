import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CompleteBookingCommand } from '../complete-booking.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CompleteBookingCommand)
export class CompleteBookingHandler implements ICommandHandler<CompleteBookingCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: CompleteBookingCommand): Promise<any> {
    const result = await this.bookingService.completeBooking(
      UuidValueObject.fromString(command.bookingId)
    );

    return result;
  }
}
