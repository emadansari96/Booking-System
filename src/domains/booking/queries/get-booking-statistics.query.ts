export class GetBookingStatisticsQuery {
  constructor(
    public readonly userId?: string,
    public readonly resourceId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date
  ) {}
}
