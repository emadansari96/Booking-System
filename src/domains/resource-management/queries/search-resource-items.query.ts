export class SearchResourceItemsQuery {
  constructor(
    public readonly resourceId?: string,
    public readonly status?: string,
    public readonly type?: string,
    public readonly isActive?: boolean,
    public readonly minCapacity?: number,
    public readonly maxCapacity?: number,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly location?: string,
    public readonly amenities?: string[],
    public readonly page: number = 1,
    public readonly limit: number = 10
  ) {}
}
