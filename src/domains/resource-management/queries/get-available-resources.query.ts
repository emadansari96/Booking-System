export class GetAvailableResourcesQuery {
  constructor(
    public readonly type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE',
    public readonly minCapacity?: number,
    public readonly maxCapacity?: number,
    public readonly minPrice?: number,
    public readonly maxPrice?: number,
    public readonly location?: string,
    public readonly amenities?: string[],
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: 'name' | 'price' | 'capacity' | 'createdAt',
    public readonly sortOrder?: 'ASC' | 'DESC'
  ) {}
}
