export class ApprovePaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly approvedBy: string
  ) {}
}