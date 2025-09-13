export class UpdateCommissionStrategyCommand {
  constructor(
    public readonly id: string,
    public readonly name?: string,
    public readonly description?: string,
    public readonly priority?: number,
    public readonly applicableResourceTypes?: string[],
    public readonly minBookingDuration?: number,
    public readonly maxBookingDuration?: number
  ) {}
}
