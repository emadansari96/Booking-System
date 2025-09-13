import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export interface CommissionNameProps {
  value: string;
}

export class CommissionName extends ValueObjectBase<CommissionNameProps> {
  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Commission name cannot be empty');
    }
    if (value.length > 100) {
      throw new Error('Commission name cannot exceed 100 characters');
    }
    super({ value: value.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  public static create(value: string): CommissionName {
    return new CommissionName(value);
  }

  public static fromPersistence(value: string): CommissionName {
    return new CommissionName(value);
  }
}
