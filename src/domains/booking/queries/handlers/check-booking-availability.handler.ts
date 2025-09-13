import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CheckBookingAvailabilityQuery } from '../check-booking-availability.query';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(CheckBookingAvailabilityQuery)
export class CheckBookingAvailabilityHandler implements IQueryHandler<CheckBookingAvailabilityQuery> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(query: CheckBookingAvailabilityQuery): Promise<any> {
    const result = await this.bookingService.checkBookingAvailability(
      UuidValueObject.fromString(query.resourceItemId),
      query.startDate,
      query.endDate
    );

    return result;
  }
}
