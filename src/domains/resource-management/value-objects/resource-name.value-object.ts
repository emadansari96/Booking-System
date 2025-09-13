import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export interface ResourceNameProps {
  value: string;
}

export class ResourceName extends ValueObjectBase<ResourceNameProps> {
  private constructor(props: ResourceNameProps) {
    super(props);
  }

  public static create(value: string): ResourceName {
    if (!value || value.trim().length === 0) {
      throw new Error('Resource name cannot be empty');
    }

    if (value.length > 100) {
      throw new Error('Resource name cannot exceed 100 characters');
    }

    return new ResourceName({ value: value.trim() });
  }

  public static fromPersistence(value: string): ResourceName {
    return new ResourceName({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
