import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetBookingStatisticsQuery } from '../get-booking-statistics.query';
import { BookingService } from '../../services/booking.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@QueryHandler(GetBookingStatisticsQuery)
export class GetBookingStatisticsHandler implements IQueryHandler<GetBookingStatisticsQuery> {
  constructor(
    private readonly bookingService: BookingService,
  ) {}

  async execute(query: GetBookingStatisticsQuery): Promise<any> {
    const result = await this.bookingService.getBookingStatistics(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.resourceId ? UuidValueObject.fromString(query.resourceId) : undefined,
      query.startDate,
      query.endDate
    );

    return result;
  }
}
