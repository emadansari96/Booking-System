export class GetAuditLogStatisticsQuery {
  constructor(
    public readonly startDate?: Date,
    public readonly endDate?: Date,
  ) {}
}
