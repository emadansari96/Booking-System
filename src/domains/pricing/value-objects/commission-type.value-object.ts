import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export enum CommissionTypeEnum {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export interface CommissionTypeProps {
  value: CommissionTypeEnum;
}

export class CommissionType extends ValueObjectBase<CommissionTypeProps> {
  constructor(value: CommissionTypeEnum) {
    if (!Object.values(CommissionTypeEnum).includes(value)) {
      throw new Error(`Invalid commission type: ${value}`);
    }
    super({ value });
  }

  get value(): CommissionTypeEnum {
    return this.props.value;
  }

  public static create(value: CommissionTypeEnum): CommissionType {
    return new CommissionType(value);
  }

  public static fromPersistence(value: string): CommissionType {
    return new CommissionType(value as CommissionTypeEnum);
  }

  public isPercentage(): boolean {
    return this.props.value === CommissionTypeEnum.PERCENTAGE;
  }

  public isFixedAmount(): boolean {
    return this.props.value === CommissionTypeEnum.FIXED_AMOUNT;
  }
}
