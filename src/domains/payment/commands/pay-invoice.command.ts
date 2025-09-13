export class PayInvoiceCommand {
  constructor(
    public readonly invoiceId: string,
    public readonly paymentMethod: string,
    public readonly paidBy: string
  ) {}
}


