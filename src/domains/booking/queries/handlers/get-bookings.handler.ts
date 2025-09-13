import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookingsQuery } from '../get-bookings.query';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@QueryHandler(GetBookingsQuery)
export class GetBookingsHandler implements IQueryHandler<GetBookingsQuery> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(query: GetBookingsQuery): Promise<any> {
    const result = await this.bookingService.getBookings(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.resourceItemId ? UuidValueObject.fromString(query.resourceItemId) : undefined,
      query.status?.value || query.status as any,
      query.startDate,
      query.endDate,
      query.page,
      query.limit
    );

    return {
      bookings: result.bookings,
      pagination: result.pagination
    };
  }
}
