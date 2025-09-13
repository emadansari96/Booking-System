export class CancelInvoiceCommand {
  constructor(
    public readonly invoiceId: string,
    public readonly cancelledBy: string,
    public readonly reason?: string
  ) {}
}


