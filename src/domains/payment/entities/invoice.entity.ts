import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { InvoiceNumber } from '../value-objects/invoice-number.value-object';
import { InvoiceStatus, InvoiceStatusEnum } from '../value-objects/invoice-status.value-object';
import { PaymentAmount } from '../value-objects/payment-amount.value-object';
import { Currency } from '../value-objects/currency.value-object';
import { InvoiceItem } from '../value-objects/invoice-item.value-object';
import { InvoiceCreatedEvent } from '../events/invoice-created.event';
import { InvoiceStatusChangedEvent } from '../events/invoice-status-changed.event';
import { InvoicePaidEvent } from '../events/invoice-paid.event';
import { InvoiceCancelledEvent } from '../events/invoice-cancelled.event';
import { InvoiceRefundedEvent } from '../events/invoice-refunded.event';

export interface InvoiceProps {
  id: UuidValueObject;
  invoiceNumber: InvoiceNumber;
  userId: UuidValueObject;
  status: InvoiceStatus;
  items: InvoiceItem[];
  subtotal: PaymentAmount;
  taxAmount: PaymentAmount;
  discountAmount: PaymentAmount;
  totalAmount: PaymentAmount;
  currency: Currency;
  dueDate: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceEntity extends AggregateRoot<InvoiceProps> {
  private constructor(props: InvoiceProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    userId: UuidValueObject,
    items: Array<{
      resourceId: UuidValueObject;
      description: string;
      quantity: number;
      unitPrice: number;
      resourceItemId?: UuidValueObject;
      metadata?: Record<string, any>;
    }>,
    currency: string,
    dueDate: Date,
    taxRate: number = 0,
    discountAmount: number = 0,
    notes?: string,
    metadata?: Record<string, any>
  ): InvoiceEntity {
    // Create invoice items
    const invoiceItems = items.map(item => 
      InvoiceItem.create(
        UuidValueObject.generate(),
        item.resourceId,
        item.description,
        item.quantity,
        item.unitPrice,
        item.resourceItemId,
        item.metadata
      )
    );

    // Calculate amounts
    const subtotal = invoiceItems.reduce(
      (sum, item) => sum + item.totalPrice.value,
      0
    );

    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount - discountAmount;

    const invoice = new InvoiceEntity({
      id,
      invoiceNumber: InvoiceNumber.generate(),
      userId,
      status: InvoiceStatus.create(InvoiceStatusEnum.DRAFT),
      items: invoiceItems,
      subtotal: PaymentAmount.create(subtotal),
      taxAmount: PaymentAmount.create(taxAmount),
      discountAmount: PaymentAmount.create(discountAmount),
      totalAmount: PaymentAmount.create(totalAmount),
      currency: Currency.create(currency as any),
      dueDate,
      notes,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    invoice.addDomainEvent(new InvoiceCreatedEvent(
      invoice.props.id.value,
      invoice.props.invoiceNumber.value,
      invoice.props.userId.value,
      invoice.props.totalAmount.value,
      invoice.props.currency.value,
    ));

    return invoice;
  }

  public static fromPersistence(props: InvoiceProps): InvoiceEntity {
    return new InvoiceEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get invoiceNumber(): InvoiceNumber {
    return this.props.invoiceNumber;
  }

  get userId(): UuidValueObject {
    return this.props.userId;
  }

  get status(): InvoiceStatus {
    return this.props.status;
  }

  get items(): InvoiceItem[] {
    return this.props.items;
  }

  get subtotal(): PaymentAmount {
    return this.props.subtotal;
  }

  get taxAmount(): PaymentAmount {
    return this.props.taxAmount;
  }

  get discountAmount(): PaymentAmount {
    return this.props.discountAmount;
  }

  get totalAmount(): PaymentAmount {
    return this.props.totalAmount;
  }

  get currency(): Currency {
    return this.props.currency;
  }

  get dueDate(): Date {
    return this.props.dueDate;
  }

  get paidAt(): Date | undefined {
    return this.props.paidAt;
  }

  get cancelledAt(): Date | undefined {
    return this.props.cancelledAt;
  }

  get refundedAt(): Date | undefined {
    return this.props.refundedAt;
  }

  get notes(): string | undefined {
    return this.props.notes;
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

  public markAsPending(): void {
    if (!this.props.status.canTransitionTo(InvoiceStatusEnum.PENDING)) {
      throw new Error(`Cannot mark invoice as pending with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = InvoiceStatus.create(InvoiceStatusEnum.PENDING);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoiceStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public markAsPaid(): void {
    if (!this.props.status.canTransitionTo(InvoiceStatusEnum.PAID)) {
      throw new Error(`Cannot mark invoice as paid with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = InvoiceStatus.create(InvoiceStatusEnum.PAID);
    this.props.paidAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoicePaidEvent(
      this.props.id.value,
      this.props.invoiceNumber.value,
      this.props.userId.value,
      this.props.totalAmount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new InvoiceStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public markAsOverdue(): void {
    if (!this.props.status.canTransitionTo(InvoiceStatusEnum.OVERDUE)) {
      throw new Error(`Cannot mark invoice as overdue with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = InvoiceStatus.create(InvoiceStatusEnum.OVERDUE);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoiceStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public cancel(): void {
    if (!this.props.status.canTransitionTo(InvoiceStatusEnum.CANCELLED)) {
      throw new Error(`Cannot cancel invoice with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = InvoiceStatus.create(InvoiceStatusEnum.CANCELLED);
    this.props.cancelledAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoiceCancelledEvent(
      this.props.id.value,
      this.props.invoiceNumber.value,
      this.props.userId.value,
      this.props.totalAmount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new InvoiceStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public refund(): void {
    if (!this.props.status.canTransitionTo(InvoiceStatusEnum.REFUNDED)) {
      throw new Error(`Cannot refund invoice with status: ${this.props.status.value}`);
    }

    const previousStatus = this.props.status.value;
    this.props.status = InvoiceStatus.create(InvoiceStatusEnum.REFUNDED);
    this.props.refundedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new InvoiceRefundedEvent(
      this.props.id.value,
      this.props.invoiceNumber.value,
      this.props.userId.value,
      this.props.totalAmount.value,
      this.props.currency.value,
    ));

    this.addDomainEvent(new InvoiceStatusChangedEvent(
      this.props.id.value,
      this.props.status.value,
      previousStatus,
    ));
  }

  public addItem(
    resourceId: UuidValueObject,
    description: string,
    quantity: number,
    unitPrice: number,
    resourceItemId?: UuidValueObject,
    metadata?: Record<string, any>
  ): void {
    const newItem = InvoiceItem.create(
      UuidValueObject.generate(),
      resourceId,
      description,
      quantity,
      unitPrice,
      resourceItemId,
      metadata
    );

    this.props.items.push(newItem);
    this.recalculateAmounts();
    this.props.updatedAt = new Date();
  }

  public removeItem(itemId: UuidValueObject): void {
    const itemIndex = this.props.items.findIndex(item => item.id.equals(itemId));
    if (itemIndex === -1) {
      throw new Error(`Invoice item with id ${itemId.value} not found`);
    }

    this.props.items.splice(itemIndex, 1);
    this.recalculateAmounts();
    this.props.updatedAt = new Date();
  }

  public updateItem(
    itemId: UuidValueObject,
    updates: {
      description?: string;
      quantity?: number;
      unitPrice?: number;
      metadata?: Record<string, any>;
    }
  ): void {
    const itemIndex = this.props.items.findIndex(item => item.id.equals(itemId));
    if (itemIndex === -1) {
      throw new Error(`Invoice item with id ${itemId.value} not found`);
    }

    const currentItem = this.props.items[itemIndex];
    let updatedItem = currentItem;

    if (updates.description !== undefined) {
      updatedItem = updatedItem.updateDescription(updates.description);
    }
    if (updates.quantity !== undefined) {
      updatedItem = updatedItem.updateQuantity(updates.quantity);
    }
    if (updates.unitPrice !== undefined) {
      updatedItem = updatedItem.updateUnitPrice(updates.unitPrice);
    }
    if (updates.metadata !== undefined) {
      updatedItem = new InvoiceItem({
        id: updatedItem.id,
        resourceId: updatedItem.resourceId,
        resourceItemId: updatedItem.resourceItemId,
        description: updatedItem.description,
        quantity: updatedItem.quantity,
        unitPrice: updatedItem.unitPrice,
        totalPrice: updatedItem.totalPrice,
        metadata: { ...updatedItem.metadata, ...updates.metadata },
      });
    }

    this.props.items[itemIndex] = updatedItem;
    this.recalculateAmounts();
    this.props.updatedAt = new Date();
  }

  private recalculateAmounts(): void {
    const subtotal = this.props.items.reduce(
      (sum, item) => sum + item.totalPrice.value,
      0
    );

    const taxAmount = subtotal * (this.props.taxAmount.value / this.props.subtotal.value);
    const totalAmount = subtotal + taxAmount - this.props.discountAmount.value;

    this.props.subtotal = PaymentAmount.create(subtotal);
    this.props.taxAmount = PaymentAmount.create(taxAmount);
    this.props.totalAmount = PaymentAmount.create(totalAmount);
  }

  public isDraft(): boolean {
    return this.props.status.isDraft();
  }

  public isPending(): boolean {
    return this.props.status.isPending();
  }

  public isPaid(): boolean {
    return this.props.status.isPaid();
  }

  public isOverdue(): boolean {
    return new Date() > this.props.dueDate && this.props.status.isPending();
  }

  public isCancelled(): boolean {
    return this.props.status.isCancelled();
  }

  public isRefunded(): boolean {
    return this.props.status.isRefunded();
  }
}
