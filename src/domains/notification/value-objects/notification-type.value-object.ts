import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum NotificationTypeEnum {
  PAYMENT_CONFIRMATION = 'PAYMENT_CONFIRMATION',
  BOOKING_CONFIRMATION = 'BOOKING_CONFIRMATION',
  BOOKING_CANCELLATION = 'BOOKING_CANCELLATION',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  RESOURCE_AVAILABLE = 'RESOURCE_AVAILABLE',
  REMINDER = 'REMINDER',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  PROMOTION = 'PROMOTION',
  SECURITY_ALERT = 'SECURITY_ALERT',
  GENERAL = 'GENERAL',
}

export interface NotificationTypeProps {
  value: NotificationTypeEnum;
}

export class NotificationType extends ValueObjectBase<NotificationTypeProps> {
  constructor(value: NotificationTypeEnum) {
    if (!Object.values(NotificationTypeEnum).includes(value)) {
      throw new Error(`Invalid notification type: ${value}`);
    }
    super({ value });
  }

  get value(): NotificationTypeEnum {
    return this.props.value;
  }

  public static create(value: NotificationTypeEnum): NotificationType {
    return new NotificationType(value);
  }

  public static fromPersistence(value: string): NotificationType {
    return new NotificationType(value as NotificationTypeEnum);
  }

  public isPaymentRelated(): boolean {
    return [
      NotificationTypeEnum.PAYMENT_CONFIRMATION,
      NotificationTypeEnum.PAYMENT_FAILED,
    ].includes(this.props.value);
  }

  public isBookingRelated(): boolean {
    return [
      NotificationTypeEnum.BOOKING_CONFIRMATION,
      NotificationTypeEnum.BOOKING_CANCELLATION,
      NotificationTypeEnum.RESOURCE_AVAILABLE,
      NotificationTypeEnum.REMINDER,
    ].includes(this.props.value);
  }

  public isSystemRelated(): boolean {
    return [
      NotificationTypeEnum.SYSTEM_UPDATE,
      NotificationTypeEnum.SECURITY_ALERT,
    ].includes(this.props.value);
  }

  public isPromotional(): boolean {
    return this.props.value === NotificationTypeEnum.PROMOTION;
  }

  public isGeneral(): boolean {
    return this.props.value === NotificationTypeEnum.GENERAL;
  }
}
