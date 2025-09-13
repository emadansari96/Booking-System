import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export interface OtpCodeProps {
  value: string;
}

export class OtpCode extends ValueObjectBase<OtpCodeProps> {
  constructor(value: string) {
    if (!value || value.length !== 6) {
      throw new Error('OTP code must be exactly 6 digits');
    }
    if (!/^\d{6}$/.test(value)) {
      throw new Error('OTP code must contain only digits');
    }
    super({ value });
  }

  get value(): string {
    return this.props.value;
  }

  public static create(value: string): OtpCode {
    return new OtpCode(value);
  }

  public static fromPersistence(value: string): OtpCode {
    return new OtpCode(value);
  }

  public static generate(): OtpCode {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return new OtpCode(code);
  }

  public equals(other: OtpCode): boolean {
    return this.props.value === other.props.value;
  }
}
