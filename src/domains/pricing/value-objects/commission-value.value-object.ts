import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface CommissionValueProps {
  value: number;
}

export class CommissionValue extends ValueObjectBase<CommissionValueProps> {
  constructor(value: number) {
    if (value < 0) {
      throw new Error('Commission value cannot be negative');
    }
    if (value > 100) {
      throw new Error('Commission percentage cannot exceed 100%');
    }
    super({ value });
  }

  get value(): number {
    return this.props.value;
  }

  public static create(value: number): CommissionValue {
    return new CommissionValue(value);
  }

  public static fromPersistence(value: number): CommissionValue {
    return new CommissionValue(value);
  }

  public calculateCommission(baseAmount: number, commissionType: string): number {
    if (commissionType === 'PERCENTAGE') {
      return (baseAmount * this.props.value) / 100;
    } else {
      // FIXED_AMOUNT
      return this.props.value;
    }
  }
}
