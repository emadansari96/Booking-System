export enum AuditSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export class AuditSeverityValueObject {
  private constructor(private readonly _value: AuditSeverity) {}

  static create(severity: AuditSeverity): AuditSeverityValueObject {
    return new AuditSeverityValueObject(severity);
  }

  static fromString(severity: string): AuditSeverityValueObject {
    if (!Object.values(AuditSeverity).includes(severity as AuditSeverity)) {
      throw new Error(`Invalid audit severity: ${severity}`);
    }
    return new AuditSeverityValueObject(severity as AuditSeverity);
  }

  get value(): AuditSeverity {
    return this._value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AuditSeverityValueObject): boolean {
    return this.value === other.value;
  }
}
