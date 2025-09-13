import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export enum NotificationPriorityEnum {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export interface NotificationPriorityProps {
  value: NotificationPriorityEnum;
}

export class NotificationPriority extends ValueObjectBase<NotificationPriorityProps> {
  constructor(value: NotificationPriorityEnum) {
    if (!Object.values(NotificationPriorityEnum).includes(value)) {
      throw new Error(`Invalid notification priority: ${value}`);
    }
    super({ value });
  }

  get value(): NotificationPriorityEnum {
    return this.props.value;
  }

  public static create(value: NotificationPriorityEnum): NotificationPriority {
    return new NotificationPriority(value);
  }

  public static fromPersistence(value: string): NotificationPriority {
    return new NotificationPriority(value as NotificationPriorityEnum);
  }

  public isLow(): boolean {
    return this.props.value === NotificationPriorityEnum.LOW;
  }

  public isNormal(): boolean {
    return this.props.value === NotificationPriorityEnum.NORMAL;
  }

  public isHigh(): boolean {
    return this.props.value === NotificationPriorityEnum.HIGH;
  }

  public isUrgent(): boolean {
    return this.props.value === NotificationPriorityEnum.URGENT;
  }

  public getNumericValue(): number {
    switch (this.props.value) {
      case NotificationPriorityEnum.LOW:
        return 1;
      case NotificationPriorityEnum.NORMAL:
        return 2;
      case NotificationPriorityEnum.HIGH:
        return 3;
      case NotificationPriorityEnum.URGENT:
        return 4;
      default:
        return 2;
    }
  }

  public isHigherThan(other: NotificationPriority): boolean {
    return this.getNumericValue() > other.getNumericValue();
  }

  public isLowerThan(other: NotificationPriority): boolean {
    return this.getNumericValue() < other.getNumericValue();
  }
}
