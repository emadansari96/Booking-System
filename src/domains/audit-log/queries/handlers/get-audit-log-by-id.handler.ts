import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAuditLogByIdQuery } from '../get-audit-log-by-id.query';
import { AuditLogService } from '../../services/audit-log.service';
import { AuditLogEntity } from '../../entities/audit-log.entity';
@QueryHandler(GetAuditLogByIdQuery)
export class GetAuditLogByIdHandler implements IQueryHandler<GetAuditLogByIdQuery> {
  constructor(private readonly auditLogService: AuditLogService) {}

  async execute(query: GetAuditLogByIdQuery): Promise<AuditLogEntity | null> {
    return await this.auditLogService.getAuditLogById(query.id);
  }
}
