export enum AuditDomain {
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  RESOURCE_MANAGEMENT = 'RESOURCE_MANAGEMENT',
  BOOKING = 'BOOKING',
  PAYMENT = 'PAYMENT',
  PRICING = 'PRICING',
  NOTIFICATION = 'NOTIFICATION',
  COMMISSION = 'COMMISSION',
  INVOICE = 'INVOICE',
  OTP = 'OTP',
  SYSTEM = 'SYSTEM',
}

export class AuditDomainValueObject {
  private constructor(private readonly _value: AuditDomain) {}

  static create(domain: AuditDomain): AuditDomainValueObject {
    return new AuditDomainValueObject(domain);
  }

  static fromString(domain: string): AuditDomainValueObject {
    if (!Object.values(AuditDomain).includes(domain as AuditDomain)) {
      throw new Error(`Invalid audit domain: ${domain}`);
    }
    return new AuditDomainValueObject(domain as AuditDomain);
  }

  get value(): AuditDomain {
    return this._value;
  }

  toString(): string {
    return this.value;
  }

  equals(other: AuditDomainValueObject): boolean {
    return this.value === other.value;
  }
}
