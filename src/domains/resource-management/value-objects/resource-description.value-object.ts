import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export interface ResourceDescriptionProps {
  value: string;
}

export class ResourceDescription extends ValueObjectBase<ResourceDescriptionProps> {
  private constructor(props: ResourceDescriptionProps) {
    super(props);
  }

  public static create(value: string): ResourceDescription {
    if (!value || value.trim().length === 0) {
      throw new Error('Resource description cannot be empty');
    }

    if (value.length > 500) {
      throw new Error('Resource description cannot exceed 500 characters');
    }

    return new ResourceDescription({ value: value.trim() });
  }

  public static fromPersistence(value: string): ResourceDescription {
    return new ResourceDescription({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
