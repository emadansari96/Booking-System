import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface PaymentAmountProps {
  value: number;
}

export class PaymentAmount extends ValueObjectBase<PaymentAmountProps> {
  constructor(value: number) {
    if (value < 0) {
      throw new Error('Payment amount cannot be negative');
    }
    if (value > 1000000) {
      throw new Error('Payment amount cannot exceed 1,000,000');
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  public static create(value: number): PaymentAmount {
    return new PaymentAmount(value);
  }

  public static fromPersistence(value: number): PaymentAmount {
    return new PaymentAmount(value);
  }

  public add(amount: PaymentAmount): PaymentAmount {
    return new PaymentAmount(this.props.value + amount.value);
  }

  public subtract(amount: PaymentAmount): PaymentAmount {
    return new PaymentAmount(this.props.value - amount.value);
  }

  public multiply(factor: number): PaymentAmount {
    return new PaymentAmount(this.props.value * factor);
  }

  public isGreaterThan(amount: PaymentAmount): boolean {
    return this.props.value > amount.value;
  }

  public isLessThan(amount: PaymentAmount): boolean {
    return this.props.value < amount.value;
  }

  public equals(amount: PaymentAmount): boolean {
    return this.props.value === amount.value;
  }
}
