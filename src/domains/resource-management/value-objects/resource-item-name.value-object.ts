import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export interface ResourceItemNameProps {
  value: string;
}

export class ResourceItemName extends ValueObjectBase<ResourceItemNameProps> {
  constructor(name: string) {
    if (!name || name.trim().length === 0) {
      throw new Error('Resource item name cannot be empty');
    }
    if (name.length > 100) {
      throw new Error('Resource item name cannot exceed 100 characters');
    }
    super({ value: name.trim() });
  }

  get value(): string {
    return this.props.value;
  }

  equals(other: ResourceItemName): boolean {
    return this.value === other.value;
  }
}
