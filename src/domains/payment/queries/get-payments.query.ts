export class GetPaymentsQuery {
  constructor(
    public readonly userId?: string,
    public readonly status?: string,
    public readonly method?: string,
    public readonly currency?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
