import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export type ResourceStatusType = 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';

export interface ResourceStatusProps {
  value: ResourceStatusType;
}

export class ResourceStatus extends ValueObjectBase<ResourceStatusProps> {
  private constructor(props: ResourceStatusProps) {
    super(props);
  }

  public static create(value: ResourceStatusType): ResourceStatus {
    const validStatuses: ResourceStatusType[] = ['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'];
    
    if (!validStatuses.includes(value)) {
      throw new Error(`Invalid resource status: ${value}. Must be one of: ${validStatuses.join(', ')}`);
    }

    return new ResourceStatus({ value });
  }

  public static fromPersistence(value: string): ResourceStatus {
    return ResourceStatus.create(value as ResourceStatusType);
  }

  public static available(): ResourceStatus {
    return new ResourceStatus({ value: 'AVAILABLE' });
  }

  public static booked(): ResourceStatus {
    return new ResourceStatus({ value: 'BOOKED' });
  }

  public static maintenance(): ResourceStatus {
    return new ResourceStatus({ value: 'MAINTENANCE' });
  }

  public static unavailable(): ResourceStatus {
    return new ResourceStatus({ value: 'UNAVAILABLE' });
  }

  get value(): ResourceStatusType {
    return this.props.value;
  }
}
