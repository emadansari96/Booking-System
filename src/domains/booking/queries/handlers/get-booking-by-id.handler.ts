import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookingByIdQuery } from '../get-booking-by-id.query';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetBookingByIdQuery)
export class GetBookingByIdHandler implements IQueryHandler<GetBookingByIdQuery> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(query: GetBookingByIdQuery): Promise<any> {
    const result = await this.bookingService.getBookingById(
      UuidValueObject.fromString(query.bookingId)
    );

    return result;
  }
}
