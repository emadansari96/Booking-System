export class GetNotificationStatisticsQuery {
  constructor(
    public readonly userId?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly type?: string
  ) {}
}
