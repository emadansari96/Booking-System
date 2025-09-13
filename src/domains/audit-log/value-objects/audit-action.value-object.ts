export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  PAYMENT = 'PAYMENT',
  BOOKING = 'BOOKING',
  NOTIFICATION = 'NOTIFICATION',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
  CONFIRM = 'CONFIRM',
  COMPLETE = 'COMPLETE',
  EXPIRE = 'EXPIRE',
}

export class AuditActionValueObject {
  private constructor(private readonly _value: AuditAction) {}

  static create(action: AuditAction): AuditActionValueObject {
    return new AuditActionValueObject(action);
  }

  static fromString(action: string): AuditActionValueObject {
    if (!Object.values(AuditAction).includes(action as AuditAction)) {
      throw new Error(`Invalid audit action: ${action}`);
    }
    return new AuditActionValueObject(action as AuditAction);
  }

  get value(): AuditAction {
    return this._value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AuditActionValueObject): boolean {
    return this.value === other.value;
  }
}
