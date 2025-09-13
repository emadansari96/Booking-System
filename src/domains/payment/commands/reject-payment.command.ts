export class RejectPaymentCommand {
  constructor(
    public readonly paymentId: string,
    public readonly rejectedBy: string,
    public readonly reason?: string
  ) {}
}


