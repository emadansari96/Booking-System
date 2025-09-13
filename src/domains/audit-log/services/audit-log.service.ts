import { Injectable, Inject } from '@nestjs/common';
import { AuditLogRepositoryInterface, AuditLogSearchCriteria, AuditLogSearchResult, AuditLogStatistics } from '../interfaces/audit-log-repository.interface';
import { AuditLogEntity } from '../entities/audit-log.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { AuditActionValueObject, AuditAction } from '../value-objects/audit-action.value-object';
import { AuditDomainValueObject, AuditDomain } from '../value-objects/audit-domain.value-object';
import { AuditStatusValueObject, AuditStatus } from '../value-objects/audit-status.value-object';
import { AuditSeverityValueObject, AuditSeverity } from '../value-objects/audit-severity.value-object';
export interface LogActivityRequest {
  userId?: UuidValueObject;
  sessionId?: string;
  action: AuditAction;
  domain: AuditDomain;
  entityType: string;
  entityId?: string;
  status: AuditStatus;
  severity: AuditSeverity;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogSearchRequest {
  userId?: string;
  sessionId?: string;
  action?: string;
  domain?: string;
  entityType?: string;
  entityId?: string;
  status?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  page?: number;
  limit?: number;
  sortBy?: 'timestamp' | 'severity' | 'action' | 'domain';
  sortOrder?: 'ASC' | 'DESC';
}
@Injectable()
export class AuditLogService {
  constructor(
    @Inject('AuditLogRepositoryInterface')
    private readonly auditLogRepository: AuditLogRepositoryInterface,
  ) {}

  async logActivity(request: LogActivityRequest): Promise<AuditLogEntity> {
    const auditLog = AuditLogEntity.create({
      userId: request.userId,
      sessionId: request.sessionId,
      action: AuditActionValueObject.create(request.action),
      domain: AuditDomainValueObject.create(request.domain),
      entityType: request.entityType,
      entityId: request.entityId,
      status: AuditStatusValueObject.create(request.status),
      severity: AuditSeverityValueObject.create(request.severity),
      description: request.description,
      oldValues: request.oldValues,
      newValues: request.newValues,
      metadata: request.metadata,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    });

    return await this.auditLogRepository.save(auditLog);
  }

  async getAuditLogById(id: string): Promise<AuditLogEntity | null> {
    return await this.auditLogRepository.findById(UuidValueObject.fromString(id));
  }

  async getAuditLogsByUser(userId: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByUserId(UuidValueObject.fromString(userId), limit);
  }

  async getAuditLogsBySession(sessionId: string): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findBySessionId(sessionId);
  }

  async getAuditLogsByDomain(domain: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByDomain(
      AuditDomainValueObject.fromString(domain),
      limit
    );
  }

  async getAuditLogsByAction(action: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByAction(
      AuditActionValueObject.fromString(action),
      limit
    );
  }

  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByEntity(entityType, entityId);
  }

  async getAuditLogsByStatus(status: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByStatus(
      AuditStatusValueObject.fromString(status),
      limit
    );
  }

  async getAuditLogsBySeverity(severity: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findBySeverity(
      AuditSeverityValueObject.fromString(severity),
      limit
    );
  }

  async getAuditLogsByDateRange(startDate: Date, endDate: Date): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByDateRange(startDate, endDate);
  }

  async getAuditLogsByIpAddress(ipAddress: string, limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findByIpAddress(ipAddress, limit);
  }

  async searchAuditLogs(request: AuditLogSearchRequest): Promise<AuditLogSearchResult> {
    const criteria: AuditLogSearchCriteria = {
      userId: request.userId ? UuidValueObject.fromString(request.userId) : undefined,
      sessionId: request.sessionId,
      action: request.action ? AuditActionValueObject.fromString(request.action) : undefined,
      domain: request.domain ? AuditDomainValueObject.fromString(request.domain) : undefined,
      entityType: request.entityType,
      entityId: request.entityId,
      status: request.status ? AuditStatusValueObject.fromString(request.status) : undefined,
      severity: request.severity ? AuditSeverityValueObject.fromString(request.severity) : undefined,
      startDate: request.startDate,
      endDate: request.endDate,
      ipAddress: request.ipAddress,
      page: request.page,
      limit: request.limit,
      sortBy: request.sortBy,
      sortOrder: request.sortOrder,
    };

    return await this.auditLogRepository.search(criteria);
  }

  async getAuditLogStatistics(startDate?: Date, endDate?: Date): Promise<AuditLogStatistics> {
    return await this.auditLogRepository.getStatistics(startDate, endDate);
  }

  async deleteOldAuditLogs(beforeDate: Date): Promise<number> {
    return await this.auditLogRepository.deleteOldLogs(beforeDate);
  }

  async getAllAuditLogs(limit?: number): Promise<AuditLogEntity[]> {
    return await this.auditLogRepository.findAll(limit);
  }

  // Convenience methods for common audit scenarios
  async logUserLogin(userId: UuidValueObject, ipAddress?: string, userAgent?: string): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action: AuditAction.LOGIN,
      domain: AuditDomain.USER_MANAGEMENT,
      entityType: 'User',
      entityId: userId.value,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.MEDIUM,
      description: 'User logged in successfully',
      ipAddress,
      userAgent,
    });
  }

  async logUserLogout(userId: UuidValueObject, ipAddress?: string, userAgent?: string): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action: AuditAction.LOGOUT,
      domain: AuditDomain.USER_MANAGEMENT,
      entityType: 'User',
      entityId: userId.value,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.LOW,
      description: 'User logged out',
      ipAddress,
      userAgent,
    });
  }

  async logEntityCreation(
    userId: UuidValueObject,
    domain: AuditDomain,
    entityType: string,
    entityId: string,
    newValues: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action: AuditAction.CREATE,
      domain,
      entityType,
      entityId,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.MEDIUM,
      description: `${entityType} created successfully`,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async logEntityUpdate(
    userId: UuidValueObject,
    domain: AuditDomain,
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    newValues: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action: AuditAction.UPDATE,
      domain,
      entityType,
      entityId,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.MEDIUM,
      description: `${entityType} updated successfully`,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  async logEntityDeletion(
    userId: UuidValueObject,
    domain: AuditDomain,
    entityType: string,
    entityId: string,
    oldValues: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action: AuditAction.DELETE,
      domain,
      entityType,
      entityId,
      status: AuditStatus.SUCCESS,
      severity: AuditSeverity.HIGH,
      description: `${entityType} deleted successfully`,
      oldValues,
      ipAddress,
      userAgent,
    });
  }

  async logFailedOperation(
    userId: UuidValueObject | undefined,
    domain: AuditDomain,
    entityType: string,
    entityId: string,
    action: AuditAction,
    error: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLogEntity> {
    return await this.logActivity({
      userId,
      action,
      domain,
      entityType,
      entityId,
      status: AuditStatus.FAILED,
      severity: AuditSeverity.HIGH,
      description: `${action} failed: ${error}`,
      metadata: { error },
      ipAddress,
      userAgent,
    });
  }
}
