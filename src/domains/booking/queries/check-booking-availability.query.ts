export class CheckBookingAvailabilityQuery {
  constructor(
    public readonly resourceItemId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly excludeBookingId?: string
  ) {}
}
