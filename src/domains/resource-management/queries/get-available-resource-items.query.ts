export class GetAvailableResourceItemsQuery {
  constructor(
    public readonly resourceId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status?: string,
    public readonly type?: string,
    public readonly minCapacity?: number,
    public readonly maxCapacity?: number,
    public readonly minPrice?: number,
    public readonly maxPrice?: number
  ) {}
}
