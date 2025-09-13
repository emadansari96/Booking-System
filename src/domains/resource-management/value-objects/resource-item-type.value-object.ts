import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum ResourceItemTypeEnum {
  ROOM = 'ROOM',
  HALL = 'HALL',
  EQUIPMENT = 'EQUIPMENT',
  SERVICE = 'SERVICE',
  VENUE = 'VENUE',
  TABLE = 'TABLE',
  SEAT = 'SEAT',
  PARKING_SPOT = 'PARKING_SPOT',
  LOCKER = 'LOCKER'
}

export interface ResourceItemTypeProps {
  value: ResourceItemTypeEnum;
}

export class ResourceItemType extends ValueObjectBase<ResourceItemTypeProps> {
  constructor(type: ResourceItemTypeEnum) {
    if (!Object.values(ResourceItemTypeEnum).includes(type)) {
      throw new Error(`Invalid resource item type: ${type}`);
    }
    super({ value: type });
  }

  get value(): ResourceItemTypeEnum {
    return this.props.value;
  }

  isRoom(): boolean {
    return this.value === ResourceItemTypeEnum.ROOM;
  }

  isHall(): boolean {
    return this.value === ResourceItemTypeEnum.HALL;
  }

  isEquipment(): boolean {
    return this.value === ResourceItemTypeEnum.EQUIPMENT;
  }

  isService(): boolean {
    return this.value === ResourceItemTypeEnum.SERVICE;
  }

  isVenue(): boolean {
    return this.value === ResourceItemTypeEnum.VENUE;
  }

  isTable(): boolean {
    return this.value === ResourceItemTypeEnum.TABLE;
  }

  isSeat(): boolean {
    return this.value === ResourceItemTypeEnum.SEAT;
  }

  isParkingSpot(): boolean {
    return this.value === ResourceItemTypeEnum.PARKING_SPOT;
  }

  isLocker(): boolean {
    return this.value === ResourceItemTypeEnum.LOCKER;
  }

  equals(other: ResourceItemType): boolean {
    return this.value === other.value;
  }
}
