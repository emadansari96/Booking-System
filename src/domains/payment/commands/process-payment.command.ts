export class ProcessPaymentCommand {
  constructor(
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly resourceType: string,
    public readonly basePrice: number,
    public readonly currency: string,
    public readonly bookingDurationHours: number,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly paymentMethod: string,
    public readonly resourceItemId?: string,
    public readonly description?: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
