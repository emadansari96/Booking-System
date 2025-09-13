import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export interface ResourceCapacityProps {
  value: number;
}

export class ResourceCapacity extends ValueObjectBase<ResourceCapacityProps> {
  constructor(props: ResourceCapacityProps) {
    super(props);
  }

  public static create(value: number): ResourceCapacity {
    if (value <= 0) {
      throw new Error('Resource capacity must be greater than 0');
    }

    if (value > 1000) {
      throw new Error('Resource capacity cannot exceed 1000');
    }

    return new ResourceCapacity({ value });
  }

  public static fromPersistence(value: number): ResourceCapacity {
    return new ResourceCapacity({ value });
  }

  get value(): number {
    return this.props.value;
  }
}
