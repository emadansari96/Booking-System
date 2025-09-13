import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../schemas/audit-log.schema';
import { AuditLogRepositoryInterface, AuditLogSearchCriteria, AuditLogSearchResult, AuditLogStatistics } from '../../../../domains/audit-log/interfaces/audit-log-repository.interface';
import { AuditLogEntity } from '../../../../domains/audit-log/entities/audit-log.entity';
import { UuidValueObject } from '../../../domain/base/value-objects/uuid.value-object';
import { AuditActionValueObject } from '../../../../domains/audit-log/value-objects/audit-action.value-object';
import { AuditDomainValueObject } from '../../../../domains/audit-log/value-objects/audit-domain.value-object';
import { AuditStatusValueObject } from '../../../../domains/audit-log/value-objects/audit-status.value-object';
import { AuditSeverityValueObject } from '../../../../domains/audit-log/value-objects/audit-severity.value-object';

@Injectable()
export class MongoDBAuditLogRepository implements AuditLogRepositoryInterface {
  constructor(
    @InjectModel(AuditLog.name) private readonly auditLogModel: Model<AuditLogDocument>,
  ) {}

  async save(entity: AuditLogEntity): Promise<AuditLogEntity> {
    const data = {
      id: entity.id.value,
      userId: entity.userId?.value,
      sessionId: entity.sessionId,
      action: entity.action.value,
      domain: entity.domain.value,
      entityType: entity.entityType,
      entityId: entity.entityId,
      status: entity.status.value,
      severity: entity.severity.value,
      description: entity.description,
      oldValues: entity.oldValues,
      newValues: entity.newValues,
      metadata: entity.metadata,
      ipAddress: entity.ipAddress,
      userAgent: entity.userAgent,
      timestamp: entity.timestamp,
    };

    const saved = await this.auditLogModel.create(data);
    return this.toDomainEntity(saved);
  }

  async findById(id: UuidValueObject): Promise<AuditLogEntity | null> {
    const log = await this.auditLogModel.findOne({ id: id.value }).exec();
    return log ? this.toDomainEntity(log) : null;
  }

  async findByUserId(userId: UuidValueObject, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ userId: userId.value })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findBySessionId(sessionId: string): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ sessionId })
      .sort({ timestamp: -1 })
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByAction(action: AuditActionValueObject, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ action: action.value })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByDomain(domain: AuditDomainValueObject, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ domain: domain.value })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByStatus(status: AuditStatusValueObject, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ status: status.value })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findBySeverity(severity: AuditSeverityValueObject, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ severity: severity.value })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ timestamp: -1 })
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async findByIpAddress(ipAddress: string, limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find({ ipAddress })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  async search(criteria: AuditLogSearchCriteria): Promise<AuditLogSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 50;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (criteria.userId) filter.userId = criteria.userId.value;
    if (criteria.sessionId) filter.sessionId = criteria.sessionId;
    if (criteria.action) filter.action = criteria.action.value;
    if (criteria.domain) filter.domain = criteria.domain.value;
    if (criteria.entityType) filter.entityType = criteria.entityType;
    if (criteria.entityId) filter.entityId = criteria.entityId;
    if (criteria.status) filter.status = criteria.status.value;
    if (criteria.severity) filter.severity = criteria.severity.value;
    if (criteria.ipAddress) filter.ipAddress = criteria.ipAddress;

    if (criteria.startDate || criteria.endDate) {
      filter.timestamp = {};
      if (criteria.startDate) filter.timestamp.$gte = criteria.startDate;
      if (criteria.endDate) filter.timestamp.$lte = criteria.endDate;
    }

    const sortField = criteria.sortBy || 'timestamp';
    const sortOrder = criteria.sortOrder === 'ASC' ? 1 : -1;
    const sort: any = { [sortField]: sortOrder };

    const [logs, total] = await Promise.all([
      this.auditLogModel.find(filter).sort(sort).skip(skip).limit(limit).exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      logs: logs.map(log => this.toDomainEntity(log)),
      total,
      page,
      limit,
      hasMore: skip + logs.length < total,
    };
  }

  async getStatistics(startDate?: Date, endDate?: Date): Promise<AuditLogStatistics> {
    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    const [
      totalLogs,
      successCount,
      failedCount,
      logsByDomain,
      logsByAction,
      logsBySeverity,
      logsByDay,
      topUsers,
      topEntities,
    ] = await Promise.all([
      this.auditLogModel.countDocuments(filter),
      this.auditLogModel.countDocuments({ ...filter, status: 'SUCCESS' }),
      this.auditLogModel.countDocuments({ ...filter, status: 'FAILED' }),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$domain', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]),
      this.auditLogModel.aggregate([
        { $match: { ...filter, userId: { $exists: true } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      this.auditLogModel.aggregate([
        { $match: { ...filter, entityType: { $exists: true } } },
        { $group: { _id: '$entityType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return {
      totalLogs,
      successCount,
      failedCount,
      logsByDomain: this.arrayToObject(logsByDomain),
      logsByAction: this.arrayToObject(logsByAction),
      logsBySeverity: this.arrayToObject(logsBySeverity),
      logsByDay: this.arrayToObject(logsByDay),
      topUsers: topUsers.map(user => ({ userId: user._id, count: user.count })),
      topEntities: topEntities.map(entity => ({ entityType: entity._id, count: entity.count })),
    };
  }

  async deleteOldLogs(beforeDate: Date): Promise<number> {
    const result = await this.auditLogModel.deleteMany({
      timestamp: { $lt: beforeDate },
    });
    return result.deletedCount || 0;
  }

  async findAll(limit: number = 100): Promise<AuditLogEntity[]> {
    const logs = await this.auditLogModel
      .find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return logs.map(log => this.toDomainEntity(log));
  }

  private toDomainEntity(mongoLog: AuditLogDocument): AuditLogEntity {
    return AuditLogEntity.fromPersistence({
      id: UuidValueObject.fromString(mongoLog.id),
      userId: mongoLog.userId ? UuidValueObject.fromString(mongoLog.userId) : undefined,
      sessionId: mongoLog.sessionId,
      action: AuditActionValueObject.fromString(mongoLog.action),
      domain: AuditDomainValueObject.fromString(mongoLog.domain),
      entityType: mongoLog.entityType,
      entityId: mongoLog.entityId,
      status: AuditStatusValueObject.fromString(mongoLog.status),
      severity: AuditSeverityValueObject.fromString(mongoLog.severity),
      description: mongoLog.description,
      oldValues: mongoLog.oldValues,
      newValues: mongoLog.newValues,
      metadata: mongoLog.metadata,
      ipAddress: mongoLog.ipAddress,
      userAgent: mongoLog.userAgent,
      timestamp: mongoLog.timestamp,
    });
  }

  private arrayToObject(arr: Array<{ _id: string; count: number }>): Record<string, number> {
    return arr.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);
  }
}
