import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { AuditAction } from '../value-objects/audit-action.value-object';
import { AuditDomain } from '../value-objects/audit-domain.value-object';
import { AuditStatus } from '../value-objects/audit-status.value-object';
import { AuditSeverity } from '../value-objects/audit-severity.value-object';

export class LogActivityCommand {
  constructor(
    public readonly userId?: UuidValueObject,
    public readonly sessionId?: string,
    public readonly action: AuditAction = AuditAction.READ,
    public readonly domain: AuditDomain = AuditDomain.SYSTEM,
    public readonly entityType: string = 'Unknown',
    public readonly entityId?: string,
    public readonly status: AuditStatus = AuditStatus.SUCCESS,
    public readonly severity: AuditSeverity = AuditSeverity.LOW,
    public readonly description: string = '',
    public readonly oldValues?: Record<string, any>,
    public readonly newValues?: Record<string, any>,
    public readonly metadata?: Record<string, any>,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
  ) {}
}
