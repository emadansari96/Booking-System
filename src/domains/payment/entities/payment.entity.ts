import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { PaymentMethod } from '../value-objects/payment-method.value-object';
import { PaymentStatus, PaymentStatusEnum } from '../value-objects/payment-status.value-object';
import { PaymentAmount } from '../value-objects/payment-amount.value-object';
import { Currency } from '../value-objects/currency.value-object';
import { PaymentCreatedEvent } from '../events/payment-created.event';
import { PaymentStatusChangedEvent } from '../events/payment-status-changed.event';
import { PaymentApprovedEvent } from '../events/payment-approved.event';
import { PaymentCompletedEvent } from '../events/payment-completed.event';
import { PaymentFailedEvent } from '../events/payment-failed.event';
import { PaymentCancelledEvent } from '../events/payment-cancelled.event';
import { PaymentRefundedEvent } from '../events/payment-refunded.event';

export interface PaymentProps {
  id: UuidValueObject;
  userId: UuidValueObject;
  invoiceId: UuidValueObject;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: PaymentAmount;
  currency: Currency;
  description?: string;
  reference?: string; // External payment reference
  metadata?: Record<string, any>;
  approvedBy?: UuidValueObject; // Admin who approved the payment
  approvedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentEntity extends AggregateRoot<PaymentProps> {
  private constructor(props: PaymentProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    userId: UuidValueObject,
    invoiceId: UuidValueObject,
    method: string,
    amount: number,
    currency: string,
    description?: string,
    reference?: string,
    metadata?: Record<string, any>
  ): PaymentEntity {
    const payment = new PaymentEntity({
      id,
      userId,
      invoiceId,
      method: PaymentMethod.create(method as any),
      status: PaymentStatus.create(PaymentStatusEnum.PENDING),
      amount: PaymentAmount.create(amount),
      currency: Currency.create(currency as any),
      description,
      reference,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    payment.addDomainEvent(new PaymentCreatedEvent(
      payment.props.id.value,
      payment.props.userId.value,
      payment.props.invoiceId.value,
      payment.props.method.value,
      payment.props.amount.value,
      payment.props.currency.value,
    ));

    return payment;
  }

  public static fromPersistence(props: PaymentProps): PaymentEntity {
    return new PaymentEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get userId(): UuidValueObject {
    return this.props.userId;
  }

  get invoiceId(): UuidValueObject {
    return this.props.invoiceId;
  }

  get method(): PaymentMethod {
    return this.props.method;
  }

  get status(): PaymentStatus {
    return this.props.status;
  }

  get amount(): PaymentAmount {
    return this.props.amount;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get reference(): string | undefined {
    return this.props.reference;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get approvedBy(): UuidValueObject | undefined {
    return this.props.approvedBy;
  }

  get approvedAt(): Date | undefined {
    return this.props.approvedAt;
  }

  get completedAt(): Date | undefined {
    return this.props.completedAt;
  }

  get failedAt(): Date | undefined {
    return this.props.failedAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get refundedAt(): Date | undefined {
    return this.props.refundedAt;
  }

  get failureReason(): string | undefined {
    return this.props.failureReason;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public approve(approvedBy: UuidValueObject): void {
    if (!this.props.status.canTransitionTo(PaymentStatusEnum.APPROVED)) {
      throw new Error(`Cannot approve payment with status: ${this.props.status.value}`);
    }

    this.props.status = PaymentStatus.create(PaymentStatusEnum.APPROVED);
    this.props.approvedBy = approvedBy;
    this.props.approvedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PaymentApprovedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.invoiceId.value,
      this.props.amount.value,
      this.props.currency.value,
      approvedBy.value,
    ));

    this.addDomainEvent(new PaymentStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      PaymentStatusEnum.PENDING,
    ));
  }

  public complete(): void {
    if (!this.props.status.canTransitionTo(PaymentStatusEnum.COMPLETED)) {
      throw new Error(`Cannot complete payment with status: ${this.props.status.value}`);
    }

    this.props.status = PaymentStatus.create(PaymentStatusEnum.COMPLETED);
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PaymentCompletedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.invoiceId.value,
      this.props.amount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new PaymentStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      PaymentStatusEnum.APPROVED,
    ));
  }

  public fail(reason: string): void {
    if (!this.props.status.canTransitionTo(PaymentStatusEnum.FAILED)) {
      throw new Error(`Cannot fail payment with status: ${this.props.status.value}`);
    }

    this.props.status = PaymentStatus.create(PaymentStatusEnum.FAILED);
    this.props.failedAt = new Date();
    this.props.failureReason = reason;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PaymentFailedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.invoiceId.value,
      this.props.amount.value,
      this.props.currency.value,
      reason,
    ));

    this.addDomainEvent(new PaymentStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      this.props.status.value,
    ));
  }

  public cancel(): void {
    if (!this.props.status.canTransitionTo(PaymentStatusEnum.CANCELLED)) {
      throw new Error(`Cannot cancel payment with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = PaymentStatus.create(PaymentStatusEnum.CANCELLED);
    this.props.cancelledAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PaymentCancelledEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.invoiceId.value,
      this.props.amount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new PaymentStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public refund(): void {
    if (!this.props.status.canTransitionTo(PaymentStatusEnum.REFUNDED)) {
      throw new Error(`Cannot refund payment with status: ${this.props.status.value}`);
    }

    this.props.status = PaymentStatus.create(PaymentStatusEnum.REFUNDED);
    this.props.refundedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new PaymentRefundedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.invoiceId.value,
      this.props.amount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new PaymentStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      PaymentStatusEnum.COMPLETED,
    ));
  }

  public updateReference(reference: string): void {
    this.props.reference = reference;
    this.props.updatedAt = new Date();
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this.props.metadata = { ...this.props.metadata, ...metadata };
    this.props.updatedAt = new Date();
  }

  public isPending(): boolean {
    return this.props.status.isPending();
  }

  public isApproved(): boolean {
    return this.props.status.isApproved();
  }

  public isCompleted(): boolean {
    return this.props.status.isCompleted();
  }

  public isFailed(): boolean {
    return this.props.status.isFailed();
  }

  public isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  public isRefunded(): boolean {
    return this.props.status.isRefunded();
  }

  public requiresApproval(): boolean {
    return this.props.method.requiresApproval();
  }
}
