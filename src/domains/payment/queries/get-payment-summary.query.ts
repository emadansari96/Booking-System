export class GetPaymentSummaryQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly status?: string
  ) {}
}
