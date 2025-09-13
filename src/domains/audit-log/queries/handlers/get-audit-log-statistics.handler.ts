import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogStatisticsQuery } from '../get-audit-log-statistics.query';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLogStatistics } from '../../interfaces/audit-log-repository.interface';
@QueryHandler(GetAuditLogStatisticsQuery)
export class GetAuditLogStatisticsHandler implements IQueryHandler<GetAuditLogStatisticsQuery> {
  constructor(private readonly auditLogService: AuditLogService) {}

  async execute(query: GetAuditLogStatisticsQuery): Promise<AuditLogStatistics> {
    return await this.auditLogService.getAuditLogStatistics(query.startDate, query.endDate);
  }
}
