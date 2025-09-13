export class CreateResourceCommand {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly capacity: number,
    public readonly price: number,
    public readonly currency: string = 'USD',
    public readonly status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE' = 'AVAILABLE',
    public readonly type: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE',
    public readonly location?: string,
    public readonly amenities?: string[],
    public readonly images?: string[]
  ) {}
}
