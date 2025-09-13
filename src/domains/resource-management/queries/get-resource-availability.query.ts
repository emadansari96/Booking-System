export class GetResourceAvailabilityQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {}
}
