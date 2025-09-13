export class VerifyOtpCommand {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly code: string,
    public readonly type: 'registration' | 'login' | 'password-reset'
  ) {}
}
