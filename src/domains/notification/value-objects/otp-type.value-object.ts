import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum OtpTypeEnum {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
}

export interface OtpTypeProps {
  value: OtpTypeEnum;
}

export class OtpType extends ValueObjectBase<OtpTypeProps> {
  constructor(value: OtpTypeEnum) {
    if (!Object.values(OtpTypeEnum).includes(value)) {
      throw new Error(`Invalid OTP type: ${value}`);
    }
    super({ value });
  }

  get value(): OtpTypeEnum {
    return this.props.value;
  }

  public static create(value: OtpTypeEnum): OtpType {
    return new OtpType(value);
  }

  public static fromPersistence(value: string): OtpType {
    return new OtpType(value as OtpTypeEnum);
  }

  public isRegistration(): boolean {
    return this.props.value === OtpTypeEnum.REGISTRATION;
  }

  public isLogin(): boolean {
    return this.props.value === OtpTypeEnum.LOGIN;
  }

  public isPasswordReset(): boolean {
    return this.props.value === OtpTypeEnum.PASSWORD_RESET;
  }
}
