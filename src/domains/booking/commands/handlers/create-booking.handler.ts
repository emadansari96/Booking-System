import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBookingCommand } from '../create-booking.command';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CreateBookingCommand)
export class CreateBookingHandler implements ICommandHandler<CreateBookingCommand> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(command: CreateBookingCommand): Promise<any> {
    const result = await this.bookingService.createBooking({
      userId: UuidValueObject.fromString(command.userId),
      resourceItemId: UuidValueObject.fromString(command.resourceItemId),
      startDate: command.startDate,
      endDate: command.endDate,
      notes: command.notes,
      metadata: command.metadata,
    });

    if (result.success && result.booking) {
      return result;
    } else {
      throw new Error(result.message || 'Failed to create booking');
    }
  }
}
