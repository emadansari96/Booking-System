import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export enum OtpStatusEnum {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  EXPIRED = 'EXPIRED',
  USED = 'USED',
}

export interface OtpStatusProps {
  value: OtpStatusEnum;
}

export class OtpStatus extends ValueObjectBase<OtpStatusProps> {
  constructor(value: OtpStatusEnum) {
    if (!Object.values(OtpStatusEnum).includes(value)) {
      throw new Error(`Invalid OTP status: ${value}`);
    }
    super({ value });
  }

  get value(): OtpStatusEnum {
    return this.props.value;
  }

  public static create(value: OtpStatusEnum): OtpStatus {
    return new OtpStatus(value);
  }

  public static fromPersistence(value: string): OtpStatus {
    return new OtpStatus(value as OtpStatusEnum);
  }

  public isPending(): boolean {
    return this.props.value === OtpStatusEnum.PENDING;
  }

  public isVerified(): boolean {
    return this.props.value === OtpStatusEnum.VERIFIED;
  }

  public isExpired(): boolean {
    return this.props.value === OtpStatusEnum.EXPIRED;
  }

  public isUsed(): boolean {
    return this.props.value === OtpStatusEnum.USED;
  }

  public canTransitionTo(newStatus: OtpStatusEnum): boolean {
    const currentStatus = this.props.value;
    
    switch (currentStatus) {
      case OtpStatusEnum.PENDING:
        return [OtpStatusEnum.VERIFIED, OtpStatusEnum.EXPIRED, OtpStatusEnum.USED].includes(newStatus);
      case OtpStatusEnum.VERIFIED:
        return [OtpStatusEnum.USED].includes(newStatus);
      case OtpStatusEnum.EXPIRED:
      case OtpStatusEnum.USED:
        return false; // Terminal states
      default:
        return false;
    }
  }
}
