export class GetAuditLogsQuery {
  constructor(
    public readonly userId?: string,
    public readonly sessionId?: string,
    public readonly action?: string,
    public readonly domain?: string,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly status?: string,
    public readonly severity?: string,
    public readonly startDate?: Date,
    public readonly endDate?: Date,
    public readonly ipAddress?: string,
    public readonly page?: number,
    public readonly limit?: number,
    public readonly sortBy?: 'timestamp' | 'severity' | 'action' | 'domain',
    public readonly sortOrder?: 'ASC' | 'DESC',
  ) {}
}
