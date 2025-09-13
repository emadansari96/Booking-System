export class CreateOtpCommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly type: 'registration' | 'login' | 'password-reset',
    public readonly expiresInMinutes?: number,
    public readonly maxAttempts?: number,
    public readonly metadata?: Record<string, any>
  ) {}
}
