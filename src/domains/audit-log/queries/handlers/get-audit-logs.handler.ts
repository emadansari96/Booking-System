import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogsQuery } from '../get-audit-logs.query';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLogSearchResult } from '../../interfaces/audit-log-repository.interface';
@QueryHandler(GetAuditLogsQuery)
export class GetAuditLogsHandler implements IQueryHandler<GetAuditLogsQuery> {
  constructor(private readonly auditLogService: AuditLogService) {}

  async execute(query: GetAuditLogsQuery): Promise<AuditLogSearchResult> {
    return await this.auditLogService.searchAuditLogs({
      userId: query.userId,
      sessionId: query.sessionId,
      action: query.action,
      domain: query.domain,
      entityType: query.entityType,
      entityId: query.entityId,
      status: query.status,
      severity: query.severity,
      startDate: query.startDate,
      endDate: query.endDate,
      ipAddress: query.ipAddress,
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }
}
