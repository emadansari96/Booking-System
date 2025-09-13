import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export type ResourceTypeType = 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE' | 'HOTEL';

export interface ResourceTypeProps {
  value: ResourceTypeType;
}

export class ResourceType extends ValueObjectBase<ResourceTypeProps> {
  private constructor(props: ResourceTypeProps) {
    super(props);
  }

  public static create(value: ResourceTypeType): ResourceType {
    const validTypes: ResourceTypeType[] = ['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE', 'HOTEL'];
    
    if (!validTypes.includes(value)) {
      throw new Error(`Invalid resource type: ${value}. Must be one of: ${validTypes.join(', ')}`);
    }

    return new ResourceType({ value });
  }

  public static fromPersistence(value: string): ResourceType {
    return ResourceType.create(value as ResourceTypeType);
  }

  public static room(): ResourceType {
    return new ResourceType({ value: 'ROOM' });
  }

  public static hall(): ResourceType {
    return new ResourceType({ value: 'HALL' });
  }

  public static equipment(): ResourceType {
    return new ResourceType({ value: 'EQUIPMENT' });
  }

  public static service(): ResourceType {
    return new ResourceType({ value: 'SERVICE' });
  }

  public static venue(): ResourceType {
    return new ResourceType({ value: 'VENUE' });
  }

  get value(): ResourceTypeType {
    return this.props.value;
  }
}
