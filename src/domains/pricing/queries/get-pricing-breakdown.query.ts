export class GetPricingBreakdownQuery {
  constructor(
    public readonly resourceId: string,
    public readonly resourceType: string,
    public readonly basePrice: number,
    public readonly currency: string,
    public readonly bookingDurationHours: number
  ) {}
}
