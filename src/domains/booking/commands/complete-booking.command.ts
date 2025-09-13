export class CompleteBookingCommand {
  constructor(
    public readonly bookingId: string,
    public readonly notes?: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
