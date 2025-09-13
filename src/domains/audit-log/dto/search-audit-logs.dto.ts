import { IsString, IsOptional, IsEnum, IsDateString, IsIP, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { AuditAction } from '../value-objects/audit-action.value-object';
import { AuditDomain } from '../value-objects/audit-domain.value-object';
import { AuditStatus } from '../value-objects/audit-status.value-object';
import { AuditSeverity } from '../value-objects/audit-severity.value-object';

export class SearchAuditLogsDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction;

  @IsOptional()
  @IsEnum(AuditDomain)
  domain?: AuditDomain;

  @IsOptional()
  @IsString()
  entityType?: string;

  @IsOptional()
  @IsString()
  entityId?: string;

  @IsOptional()
  @IsEnum(AuditStatus)
  status?: AuditStatus;

  @IsOptional()
  @IsEnum(AuditSeverity)
  severity?: AuditSeverity;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsIP()
  ipAddress?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(1000)
  limit?: number;

  @IsOptional()
  @IsEnum(['timestamp', 'severity', 'action', 'domain'])
  sortBy?: 'timestamp' | 'severity' | 'action' | 'domain';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
