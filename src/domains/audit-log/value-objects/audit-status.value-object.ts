export enum AuditStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
}

export class AuditStatusValueObject {
  private constructor(private readonly _value: AuditStatus) {}

  static create(status: AuditStatus): AuditStatusValueObject {
    return new AuditStatusValueObject(status);
  }

  static fromString(status: string): AuditStatusValueObject {
    if (!Object.values(AuditStatus).includes(status as AuditStatus)) {
      throw new Error(`Invalid audit status: ${status}`);
    }
    return new AuditStatusValueObject(status as AuditStatus);
  }

  get value(): AuditStatus {
    return this._value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AuditStatusValueObject): boolean {
    return this.value === other.value;
  }
}
