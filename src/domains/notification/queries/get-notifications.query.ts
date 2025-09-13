export class GetNotificationsQuery {
  constructor(
    public readonly userId?: string,
    public readonly type?: string,
    public readonly status?: string,
    public readonly priority?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: 'createdAt' | 'scheduledAt' | 'priority' | 'status',
    public readonly sortOrder?: 'ASC' | 'DESC'
  ) {}
}
