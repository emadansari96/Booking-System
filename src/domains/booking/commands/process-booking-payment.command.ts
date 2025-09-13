export class ProcessBookingPaymentCommand {
  constructor(
    public readonly bookingId: string,
    public readonly paymentMethod: string,
    public readonly metadata?: Record<string, any>
  ) {}
}
