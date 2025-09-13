export class CreateCommissionStrategyCommand {
  constructor(
    public readonly name: string,
    public readonly type: 'PERCENTAGE' | 'FIXED_AMOUNT',
    public readonly value: number,
    public readonly description?: string,
    public readonly priority: number = 1,
    public readonly applicableResourceTypes?: string[],
    public readonly minBookingDuration?: number,
    public readonly maxBookingDuration?: number
  ) {}
}
