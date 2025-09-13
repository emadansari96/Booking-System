import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum NotificationStatusEnum {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface NotificationStatusProps {
  value: NotificationStatusEnum;
}

export class NotificationStatus extends ValueObjectBase<NotificationStatusProps> {
  constructor(value: NotificationStatusEnum) {
    if (!Object.values(NotificationStatusEnum).includes(value)) {
      throw new Error(`Invalid notification status: ${value}`);
    }
    super({ value });
  }

  get value(): NotificationStatusEnum {
    return this.props.value;
  }

  public static create(value: NotificationStatusEnum): NotificationStatus {
    return new NotificationStatus(value);
  }

  public static fromPersistence(value: string): NotificationStatus {
    return new NotificationStatus(value as NotificationStatusEnum);
  }

  public isPending(): boolean {
    return this.props.value === NotificationStatusEnum.PENDING;
  }

  public isSent(): boolean {
    return this.props.value === NotificationStatusEnum.SENT;
  }

  public isDelivered(): boolean {
    return this.props.value === NotificationStatusEnum.DELIVERED;
  }

  public isFailed(): boolean {
    return this.props.value === NotificationStatusEnum.FAILED;
  }

  public isCancelled(): boolean {
    return this.props.value === NotificationStatusEnum.CANCELLED;
  }

  public canTransitionTo(newStatus: NotificationStatusEnum): boolean {
    const currentStatus = this.props.value;
    
    switch (currentStatus) {
      case NotificationStatusEnum.PENDING:
        return [NotificationStatusEnum.SENT, NotificationStatusEnum.FAILED, NotificationStatusEnum.CANCELLED].includes(newStatus);
      case NotificationStatusEnum.SENT:
        return [NotificationStatusEnum.DELIVERED, NotificationStatusEnum.FAILED].includes(newStatus);
      case NotificationStatusEnum.DELIVERED:
      case NotificationStatusEnum.FAILED:
      case NotificationStatusEnum.CANCELLED:
        return false; // Terminal states
      default:
        return false;
    }
  }
}
