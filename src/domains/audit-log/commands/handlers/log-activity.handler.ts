import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LogActivityCommand } from '../log-activity.command';
import { AuditLogService } from '../../services/audit-log.service';

@CommandHandler(LogActivityCommand)
export class LogActivityHandler implements ICommandHandler<LogActivityCommand> {
  constructor(private readonly auditLogService: AuditLogService) {}

  async execute(command: LogActivityCommand): Promise<void> {
    await this.auditLogService.logActivity({
      userId: command.userId,
      sessionId: command.sessionId,
      action: command.action,
      domain: command.domain,
      entityType: command.entityType,
      entityId: command.entityId,
      status: command.status,
      severity: command.severity,
      description: command.description,
      oldValues: command.oldValues,
      newValues: command.newValues,
      metadata: command.metadata,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
    });
  }
}
