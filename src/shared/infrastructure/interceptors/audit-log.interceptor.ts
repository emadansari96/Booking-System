import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { CommandBus } from '@nestjs/cqrs';
import { LogActivityCommand } from '../../../domains/audit-log/commands/log-activity.command';
import { AUDIT_LOG_KEY, AuditLogOptions } from '../decorators/audit-log.decorator';
import { UuidValueObject } from '../../domain/base/value-objects/uuid.value-object';
import { AuditStatus } from '../../../domains/audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../../domains/audit-log/value-objects/audit-severity.value-object';
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly commandBus: CommandBus,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditOptions = this.reflector.get<AuditLogOptions>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditOptions) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id ? UuidValueObject.fromString(request.user.id) : undefined;
    const ipAddress = request.ip || request.connection.remoteAddress;
    const userAgent = request.headers['user-agent'];

    const startTime = Date.now();

    return next.handle().pipe(
      tap((data) => {
        if (auditOptions.logOnSuccess !== false) {
          this.logActivity({
            userId,
            action: auditOptions.action,
            domain: auditOptions.domain,
            entityType: auditOptions.entityType,
            status: AuditStatus.SUCCESS,
            severity: auditOptions.severity || 'MEDIUM',
            description: auditOptions.description || `${auditOptions.action} operation completed successfully`,
            metadata: {
              executionTime: Date.now() - startTime,
              responseSize: JSON.stringify(data).length,
            },
            ipAddress,
            userAgent,
          });
        }
      }),
      catchError((error) => {
        if (auditOptions.logOnError !== false) {
          this.logActivity({
            userId,
            action: auditOptions.action,
            domain: auditOptions.domain,
            entityType: auditOptions.entityType,
            status: AuditStatus.FAILED,
            severity: AuditSeverity.HIGH,
            description: auditOptions.description || `${auditOptions.action} operation failed`,
            metadata: {
              error: error.message,
              stack: error.stack,
              executionTime: Date.now() - startTime,
            },
            ipAddress,
            userAgent,
          });
        }
        throw error;
      }),
    );
  }

  private async logActivity(logData: {
    userId?: UuidValueObject;
    action: any;
    domain: any;
    entityType: string;
    status: any;
    severity: any;
    description: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const command = new LogActivityCommand(
        logData.userId,
        undefined, // sessionId
        logData.action,
        logData.domain,
        logData.entityType,
        undefined, // entityId
        logData.status,
        logData.severity,
        logData.description,
        undefined, // oldValues
        undefined, // newValues
        logData.metadata,
        logData.ipAddress,
        logData.userAgent,
      );

      await this.commandBus.execute(command);
    } catch (error) {
      this.logger.error('Failed to log audit activity:', error);
    }
  }
}
