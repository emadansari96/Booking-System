export class GetPaymentsQuery {
  constructor(
    public readonly userId?: string,
    public readonly status?: string,
    public readonly page?: number,
    public readonly limit?: number
  ) {}
}