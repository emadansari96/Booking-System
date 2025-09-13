import { SetMetadata } from '@nestjs/common';
import { AuditAction } from '../../../domains/audit-log/value-objects/audit-action.value-object';
import { AuditDomain } from '../../../domains/audit-log/value-objects/audit-domain.value-object';
import { AuditSeverity } from '../../../domains/audit-log/value-objects/audit-severity.value-object';

export interface AuditLogOptions {
  action: AuditAction;
  domain: AuditDomain;
  entityType: string;
  severity?: AuditSeverity;
  description?: string;
  logOnSuccess?: boolean;
  logOnError?: boolean;
}

export const AUDIT_LOG_KEY = 'auditLog';

export const AuditLog = (options: AuditLogOptions) => SetMetadata(AUDIT_LOG_KEY, options);
