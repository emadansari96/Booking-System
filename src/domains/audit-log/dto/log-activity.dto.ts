import { IsString, IsOptional, IsEnum, IsObject, IsDateString, IsIP } from 'class-validator';
import { AuditAction } from '../value-objects/audit-action.value-object';
import { AuditDomain } from '../value-objects/audit-domain.value-object';
import { AuditStatus } from '../value-objects/audit-status.value-object';
import { AuditSeverity } from '../value-objects/audit-severity.value-object';

export class LogActivityDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsEnum(AuditDomain)
  domain: AuditDomain;

  @IsString()
  entityType: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsEnum(AuditStatus)
  status: AuditStatus;

  @IsEnum(AuditSeverity)
  severity: AuditSeverity;

  @IsString()
  description: string;

  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;
}
