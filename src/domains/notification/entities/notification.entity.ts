import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { NotificationType, NotificationTypeEnum } from '../value-objects/notification-type.value-object';
import { NotificationStatus, NotificationStatusEnum } from '../value-objects/notification-status.value-object';
import { NotificationPriority, NotificationPriorityEnum } from '../value-objects/notification-priority.value-object';
import { NotificationCreatedEvent } from '../events/notification-created.event';
import { NotificationSentEvent } from '../events/notification-sent.event';
import { NotificationDeliveredEvent } from '../events/notification-delivered.event';
import { NotificationFailedEvent } from '../events/notification-failed.event';
import { NotificationCancelledEvent } from '../events/notification-cancelled.event';
export interface NotificationProps {
  id: UuidValueObject;
  userId: UuidValueObject;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  title: string;
  message: string;
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationEntity extends AggregateRoot<NotificationProps> {
  private constructor(props: NotificationProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    userId: UuidValueObject,
    type: string,
    title: string,
    message: string,
    priority: string = 'NORMAL',
    email?: string,
    phoneNumber?: string,
    metadata?: Record<string, any>,
    scheduledAt?: Date,
    maxRetries: number = 3
  ): NotificationEntity {
    try {
      const notificationType = NotificationType.create(type as NotificationTypeEnum);
      const notificationStatus = NotificationStatus.create(NotificationStatusEnum.PENDING);
      const notificationPriority = NotificationPriority.create(priority as any);

      const notification = new NotificationEntity({
        id,
        userId,
        type: notificationType,
        status: notificationStatus,
        priority: notificationPriority,
        title,
        message,
        email,
        phoneNumber,
        metadata,
        scheduledAt,
        retryCount: 0,
        maxRetries,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      notification.addDomainEvent(new NotificationCreatedEvent(
        notification.props.id.value,
        notification.props.userId.value,
        notification.props.type.value,
        notification.props.title,
        notification.props.priority.value,
      ));

      return notification;
    } catch (error) {
      console.error('NotificationEntity.create error:', error);
      throw error;
    }
  }

  public static fromPersistence(props: NotificationProps): NotificationEntity {
    return new NotificationEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get userId(): UuidValueObject {
    return this.props.userId;
  }

  get type(): NotificationType {
    return this.props.type;
  }

  get status(): NotificationStatus {
    return this.props.status;
  }

  get priority(): NotificationPriority {
    return this.props.priority;
  }

  get title(): string {
    return this.props.title;
  }

  get message(): string {
    return this.props.message;
  }

  get email(): string | undefined {
    return this.props.email;
  }

  get phoneNumber(): string | undefined {
    return this.props.phoneNumber;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get scheduledAt(): Date | undefined {
    return this.props.scheduledAt;
  }

  get sentAt(): Date | undefined {
    return this.props.sentAt;
  }

  get deliveredAt(): Date | undefined {
    return this.props.deliveredAt;
  }

  get failedAt(): Date | undefined {
    return this.props.failedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get failureReason(): string | undefined {
    return this.props.failureReason;
  }

  get retryCount(): number {
    return this.props.retryCount;
  }

  get maxRetries(): number {
    return this.props.maxRetries;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public markAsSent(): void {
    if (!this.props.status.canTransitionTo(NotificationStatusEnum.SENT)) {
      throw new Error(`Cannot mark notification as sent with status: ${this.props.status.value}`);
    }

    this.props.status = NotificationStatus.create(NotificationStatusEnum.SENT);
    this.props.sentAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationSentEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.type.value,
      this.props.title,
    ));
  }

  public markAsDelivered(): void {
    if (!this.props.status.canTransitionTo(NotificationStatusEnum.DELIVERED)) {
      throw new Error(`Cannot mark notification as delivered with status: ${this.props.status.value}`);
    }

    this.props.status = NotificationStatus.create(NotificationStatusEnum.DELIVERED);
    this.props.deliveredAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationDeliveredEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.type.value,
      this.props.title,
    ));
  }

  public markAsFailed(reason: string): void {
    if (!this.props.status.canTransitionTo(NotificationStatusEnum.FAILED)) {
      throw new Error(`Cannot mark notification as failed with status: ${this.props.status.value}`);
    }

    this.props.status = NotificationStatus.create(NotificationStatusEnum.FAILED);
    this.props.failedAt = new Date();
    this.props.failureReason = reason;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationFailedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.type.value,
      this.props.title,
      reason,
    ));
  }

  public cancel(): void {
    if (!this.props.status.canTransitionTo(NotificationStatusEnum.CANCELLED)) {
      throw new Error(`Cannot cancel notification with status: ${this.props.status.value}`);
    }

    this.props.status = NotificationStatus.create(NotificationStatusEnum.CANCELLED);
    this.props.cancelledAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new NotificationCancelledEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.type.value,
      this.props.title,
    ));
  }

  public incrementRetryCount(): void {
    this.props.retryCount += 1;
    this.props.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.props.retryCount < this.props.maxRetries && this.props.status.isFailed();
  }

  public isReadyToSend(): boolean {
    if (!this.props.status.isPending()) {
      return false;
    }

    if (this.props.scheduledAt && this.props.scheduledAt > new Date()) {
      return false;
    }

    return true;
  }

  public isPending(): boolean {
    return this.props.status.isPending();
  }

  public isSent(): boolean {
    return this.props.status.isSent();
  }

  public isDelivered(): boolean {
    return this.props.status.isDelivered();
  }

  public isFailed(): boolean {
    return this.props.status.isFailed();
  }

  public isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  public hasEmail(): boolean {
    return !!this.props.email;
  }

  public hasPhoneNumber(): boolean {
    return !!this.props.phoneNumber;
  }

  public isScheduled(): boolean {
    return !!this.props.scheduledAt;
  }

  public isOverdue(): boolean {
    return this.props.scheduledAt ? this.props.scheduledAt < new Date() : false;
  }
}
