export class FailPaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly reason: string
  ) {}
}
