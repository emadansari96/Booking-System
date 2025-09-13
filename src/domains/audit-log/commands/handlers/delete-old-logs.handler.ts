import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteOldLogsCommand } from '../delete-old-logs.command';
import { AuditLogService } from '../../services/audit-log.service';
@CommandHandler(DeleteOldLogsCommand)
export class DeleteOldLogsHandler implements ICommandHandler<DeleteOldLogsCommand> {
  constructor(private readonly auditLogService: AuditLogService) {}

  async execute(command: DeleteOldLogsCommand): Promise<number> {
    return await this.auditLogService.deleteOldAuditLogs(command.beforeDate);
  }
}
