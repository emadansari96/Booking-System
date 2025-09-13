import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { AuditActionValueObject } from '../value-objects/audit-action.value-object';
import { AuditDomainValueObject } from '../value-objects/audit-domain.value-object';
import { AuditStatusValueObject } from '../value-objects/audit-status.value-object';
import { AuditSeverityValueObject } from '../value-objects/audit-severity.value-object';

export interface AuditLogProps {
  id: UuidValueObject;
  userId?: UuidValueObject;
  sessionId?: string;
  action: AuditActionValueObject;
  domain: AuditDomainValueObject;
  entityType: string;
  entityId?: string;
  status: AuditStatusValueObject;
  severity: AuditSeverityValueObject;
  description: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export class AuditLogEntity {
  private constructor(private readonly props: AuditLogProps) {}

  static create(props: Omit<AuditLogProps, 'id' | 'timestamp'>): AuditLogEntity {
    return new AuditLogEntity({
      ...props,
      id: UuidValueObject.generate(),
      timestamp: new Date(),
    });
  }

  static fromPersistence(props: AuditLogProps): AuditLogEntity {
    return new AuditLogEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get userId(): UuidValueObject | undefined {
    return this.props.userId;
  }

  get sessionId(): string | undefined {
    return this.props.sessionId;
  }

  get action(): AuditActionValueObject {
    return this.props.action;
  }

  get domain(): AuditDomainValueObject {
    return this.props.domain;
  }

  get entityType(): string {
    return this.props.entityType;
  }

  get entityId(): string | undefined {
    return this.props.entityId;
  }

  get status(): AuditStatusValueObject {
    return this.props.status;
  }

  get severity(): AuditSeverityValueObject {
    return this.props.severity;
  }

  get description(): string {
    return this.props.description;
  }

  get oldValues(): Record<string, any> | undefined {
    return this.props.oldValues;
  }

  get newValues(): Record<string, any> | undefined {
    return this.props.newValues;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  // Business methods
  isSuccess(): boolean {
    return this.props.status.value === 'SUCCESS';
  }

  isFailed(): boolean {
    return this.props.status.value === 'FAILED';
  }

  isHighSeverity(): boolean {
    return this.props.severity.value === 'HIGH' || this.props.severity.value === 'CRITICAL';
  }

  getChangeSummary(): string {
    if (this.props.oldValues && this.props.newValues) {
      const changedFields = Object.keys(this.props.newValues).filter(
        key => this.props.oldValues![key] !== this.props.newValues![key]
      );
      return `Changed fields: ${changedFields.join(', ')}`;
    }
    return 'No changes recorded';
  }

  toJSON(): Record<string, any> {
    return {
      id: this.props.id.value,
      userId: this.props.userId?.value,
      sessionId: this.props.sessionId,
      action: this.props.action.value,
      domain: this.props.domain.value,
      entityType: this.props.entityType,
      entityId: this.props.entityId,
      status: this.props.status.value,
      severity: this.props.severity.value,
      description: this.props.description,
      oldValues: this.props.oldValues,
      newValues: this.props.newValues,
      metadata: this.props.metadata,
      ipAddress: this.props.ipAddress,
      userAgent: this.props.userAgent,
      timestamp: this.props.timestamp.toISOString(),
    };
  }
}
