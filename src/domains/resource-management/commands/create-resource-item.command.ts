export class CreateResourceItemCommand {
  constructor(
    public readonly resourceId: string,
    public readonly name: string,
    public readonly type: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE' | 'TABLE' | 'SEAT' | 'PARKING_SPOT' | 'LOCKER',
    public readonly capacity: number,
    public readonly price: number,
    public readonly currency: string = 'USD',
    public readonly status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE' | 'OUT_OF_ORDER' = 'AVAILABLE',
    public readonly description?: string,
    public readonly location?: string,
    public readonly amenities?: string[],
    public readonly images?: string[]
  ) {}
}
