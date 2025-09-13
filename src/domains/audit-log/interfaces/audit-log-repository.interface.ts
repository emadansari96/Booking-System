import { AuditLogEntity } from '../entities/audit-log.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { AuditActionValueObject } from '../value-objects/audit-action.value-object';
import { AuditDomainValueObject } from '../value-objects/audit-domain.value-object';
import { AuditStatusValueObject } from '../value-objects/audit-status.value-object';
import { AuditSeverityValueObject } from '../value-objects/audit-severity.value-object';
export interface AuditLogSearchCriteria {
  userId?: UuidValueObject;
  sessionId?: string;
  action?: AuditActionValueObject;
  domain?: AuditDomainValueObject;
  entityType?: string;
  entityId?: string;
  status?: AuditStatusValueObject;
  severity?: AuditSeverityValueObject;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'severity' | 'action' | 'domain';
  sortOrder?: 'ASC' | 'DESC';
}

export interface AuditLogSearchResult {
  logs: AuditLogEntity[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface AuditLogStatistics {
  totalLogs: number;
  successCount: number;
  failedCount: number;
  logsByDomain: Record<string, number>;
  logsByAction: Record<string, number>;
  logsBySeverity: Record<string, number>;
  logsByDay: Record<string, number>;
  topUsers: Array<{ userId: string; count: number }>;
  topEntities: Array<{ entityType: string; count: number }>;
}

export interface AuditLogRepositoryInterface {
  save(entity: AuditLogEntity): Promise<AuditLogEntity>;
  findById(id: UuidValueObject): Promise<AuditLogEntity | null>;
  findByUserId(userId: UuidValueObject, limit?: number): Promise<AuditLogEntity[]>;
  findBySessionId(sessionId: string): Promise<AuditLogEntity[]>;
  findByAction(action: AuditActionValueObject, limit?: number): Promise<AuditLogEntity[]>;
  findByDomain(domain: AuditDomainValueObject, limit?: number): Promise<AuditLogEntity[]>;
  findByEntity(entityType: string, entityId: string): Promise<AuditLogEntity[]>;
  findByStatus(status: AuditStatusValueObject, limit?: number): Promise<AuditLogEntity[]>;
  findBySeverity(severity: AuditSeverityValueObject, limit?: number): Promise<AuditLogEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AuditLogEntity[]>;
  findByIpAddress(ipAddress: string, limit?: number): Promise<AuditLogEntity[]>;
  search(criteria: AuditLogSearchCriteria): Promise<AuditLogSearchResult>;
  getStatistics(startDate?: Date, endDate?: Date): Promise<AuditLogStatistics>;
  deleteOldLogs(beforeDate: Date): Promise<number>;
  findAll(limit?: number): Promise<AuditLogEntity[]>;
}
