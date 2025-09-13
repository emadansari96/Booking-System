export class GetCommissionStrategiesQuery {
  constructor(
    public readonly isActive?: boolean,
    public readonly type?: 'PERCENTAGE' | 'FIXED_AMOUNT',
    public readonly resourceType?: string,
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
