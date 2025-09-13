import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export enum ResourceItemStatusEnum {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export interface ResourceItemStatusProps {
  value: ResourceItemStatusEnum;
}

export class ResourceItemStatus extends ValueObjectBase<ResourceItemStatusProps> {
  constructor(status: ResourceItemStatusEnum) {
    if (!Object.values(ResourceItemStatusEnum).includes(status)) {
      throw new Error(`Invalid resource item status: ${status}`);
    }
    super({ value: status });
  }

  get value(): ResourceItemStatusEnum {
    return this.props.value;
  }

  isAvailable(): boolean {
    return this.value === ResourceItemStatusEnum.AVAILABLE;
  }

  isBooked(): boolean {
    return this.value === ResourceItemStatusEnum.BOOKED;
  }

  isMaintenance(): boolean {
    return this.value === ResourceItemStatusEnum.MAINTENANCE;
  }

  isUnavailable(): boolean {
    return this.value === ResourceItemStatusEnum.UNAVAILABLE;
  }

  isOutOfOrder(): boolean {
    return this.value === ResourceItemStatusEnum.OUT_OF_ORDER;
  }

  equals(other: ResourceItemStatus): boolean {
    return this.value === other.value;
  }
}
