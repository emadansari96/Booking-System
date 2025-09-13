export class CreateBulkNotificationCommand {
  constructor(
    public readonly userIds: string[],
    public readonly type: string,
    public readonly title: string,
    public readonly message: string,
    public readonly priority?: string,
    public readonly metadata?: Record<string, any>,
    public readonly scheduledAt?: Date,
    public readonly maxRetries?: number
  ) {}
}
