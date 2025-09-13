export class ChangeResourceItemStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE' | 'OUT_OF_ORDER'
  ) {}
}
