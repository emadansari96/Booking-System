export class CancelPaymentCommand {
  constructor(
    public readonly paymentId: string
  ) {}
}
