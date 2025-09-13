import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { BookingStatus, BookingStatusEnum } from '../value-objects/booking-status.value-object';
import { BookingPeriod } from '../value-objects/booking-period.value-object';
import { BookingPrice } from '../value-objects/booking-price.value-object';
import { BookingCreatedEvent } from '../events/booking-created.event';
import { BookingConfirmedEvent } from '../events/booking-confirmed.event';
import { BookingCancelledEvent } from '../events/booking-cancelled.event';
import { BookingCompletedEvent } from '../events/booking-completed.event';
import { BookingExpiredEvent } from '../events/booking-expired.event';
import { BookingPaymentPendingEvent } from '../events/booking-payment-pending.event';
import { BookingPaymentFailedEvent } from '../events/booking-payment-failed.event';
export interface BookingProps {
  id: UuidValueObject;
  userId: UuidValueObject;
  resourceItemId: UuidValueObject;
  status: BookingStatus;
  period: BookingPeriod;
  price: BookingPrice;
  notes?: string;
  paymentDeadline?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  expiredAt?: Date;
  paymentFailedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingEntity extends AggregateRoot<BookingProps> {
  private constructor(props: BookingProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    userId: UuidValueObject,
    resourceItemId: UuidValueObject,
    startDate: Date,
    endDate: Date,
    basePrice: number,
    commissionAmount: number,
    currency: string,
    notes?: string,
    paymentDeadlineMinutes: number = 10,
    metadata?: Record<string, any>,
    totalPrice?: number
  ): BookingEntity {
    const period = BookingPeriod.create(startDate, endDate);
    const price = BookingPrice.create(basePrice, commissionAmount, currency, totalPrice);
    const paymentDeadline = new Date(Date.now() + paymentDeadlineMinutes * 60 * 1000);

    const booking = new BookingEntity({
      id,
      userId,
      resourceItemId,
      status: BookingStatus.create(BookingStatusEnum.PENDING),
      period,
      price,
      notes,
      paymentDeadline,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    booking.addDomainEvent(new BookingCreatedEvent(
      booking.props.id.value,
      booking.props.userId.value,
      booking.props.resourceItemId.value,
      booking.props.period.startDate,
      booking.props.period.endDate,
      booking.props.price.totalPrice,
      booking.props.price.currency,
      booking.props.paymentDeadline!,
    ));

    return booking;
  }

  public static fromPersistence(props: BookingProps): BookingEntity {
    return new BookingEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get userId(): UuidValueObject {
    return this.props.userId;
  }

  get resourceItemId(): UuidValueObject {
    return this.props.resourceItemId;
  }

  get status(): BookingStatus {
    return this.props.status;
  }

  get period(): BookingPeriod {
    return this.props.period;
  }

  get price(): BookingPrice {
    return this.props.price;
  }

  get notes(): string | undefined {
    return this.props.notes;
  }

  get paymentDeadline(): Date | undefined {
    return this.props.paymentDeadline;
  }

  get confirmedAt(): Date | undefined {
    return this.props.confirmedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get expiredAt(): Date | undefined {
    return this.props.expiredAt;
  }

  get paymentFailedAt(): Date | undefined {
    return this.props.paymentFailedAt;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public confirm(): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.CONFIRMED)) {
      throw new Error(`Cannot confirm booking with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.CONFIRMED);
    this.props.confirmedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new BookingConfirmedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
    ));
  }

  public cancel(reason?: string): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.CANCELLED)) {
      throw new Error(`Cannot cancel booking with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.CANCELLED);
    this.props.cancelledAt = new Date();
    this.props.updatedAt = new Date();

    if (reason && this.props.metadata) {
      this.props.metadata.cancellationReason = reason;
    }

    this.addDomainEvent(new BookingCancelledEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
      reason,
    ));
  }

  public complete(): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.COMPLETED)) {
      throw new Error(`Cannot complete booking with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.COMPLETED);
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new BookingCompletedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
    ));
  }

  public expire(): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.EXPIRED)) {
      throw new Error(`Cannot expire booking with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.EXPIRED);
    this.props.expiredAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new BookingExpiredEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
    ));
  }

  public markPaymentPending(): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.PAYMENT_PENDING)) {
      throw new Error(`Cannot mark booking as payment pending with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.PAYMENT_PENDING);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new BookingPaymentPendingEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
      this.props.price.totalPrice,
      this.props.price.currency,
      this.props.paymentDeadline!,
    ));
  }

  public markPaymentFailed(): void {
    if (!this.props.status.canTransitionTo(BookingStatusEnum.PAYMENT_FAILED)) {
      throw new Error(`Cannot mark booking as payment failed with status: ${this.props.status.value}`);
    }

    this.props.status = BookingStatus.create(BookingStatusEnum.PAYMENT_FAILED);
    this.props.paymentFailedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new BookingPaymentFailedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.resourceItemId.value,
      this.props.period.startDate,
      this.props.period.endDate,
      this.props.price.totalPrice,
      this.props.price.currency,
    ));
  }

  public isPaymentOverdue(): boolean {
    return this.props.paymentDeadline ? new Date() > this.props.paymentDeadline : false;
  }

  public isExpired(): boolean {
    return this.props.status.isExpired();
  }

  public isActive(): boolean {
    return this.props.status.isActive();
  }

  public isPending(): boolean {
    return this.props.status.isPending();
  }

  public isConfirmed(): boolean {
    return this.props.status.isConfirmed();
  }

  public isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  public isCompleted(): boolean {
    return this.props.status.isCompleted();
  }

  public isPaymentPending(): boolean {
    return this.props.status.isPaymentPending();
  }

  public isPaymentFailed(): boolean {
    return this.props.status.isPaymentFailed();
  }

  public canBeCancelled(): boolean {
    return this.props.status.canTransitionTo(BookingStatusEnum.CANCELLED);
  }

  public canBeConfirmed(): boolean {
    return this.props.status.canTransitionTo(BookingStatusEnum.CONFIRMED);
  }

  public canBeCompleted(): boolean {
    return this.props.status.canTransitionTo(BookingStatusEnum.COMPLETED);
  }

  public canExpire(): boolean {
    return this.props.status.canTransitionTo(BookingStatusEnum.EXPIRED);
  }

  public getTimeUntilPaymentDeadline(): number {
    if (!this.props.paymentDeadline) return 0;
    return Math.max(0, this.props.paymentDeadline.getTime() - new Date().getTime());
  }

  public getTimeUntilStart(): number {
    return Math.max(0, this.props.period.startDate.getTime() - new Date().getTime());
  }

  public getTimeUntilEnd(): number {
    return Math.max(0, this.props.period.endDate.getTime() - new Date().getTime());
  }
}
