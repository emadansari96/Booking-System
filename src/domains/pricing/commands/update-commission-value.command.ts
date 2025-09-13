export class UpdateCommissionValueCommand {
  constructor(
    public readonly id: string,
    public readonly type: 'PERCENTAGE' | 'FIXED_AMOUNT',
    public readonly value: number
  ) {}
}
