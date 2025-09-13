export class CreateBookingCommand {
  constructor(
    public readonly userId: string,
    public readonly resourceItemId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly notes?: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
