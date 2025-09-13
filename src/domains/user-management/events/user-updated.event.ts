export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email?: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phone?: string,
    public readonly avatarUrl?: string
  ) {}
}
