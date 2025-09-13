export class ChangeResourceStatusCommand {
  constructor(
    public readonly id: string,
    public readonly status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE'
  ) {}
}
