import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { PaymentAmount } from './payment-amount.value-object';
export interface InvoiceItemProps {
  id: UuidValueObject;
  resourceId: UuidValueObject;
  resourceItemId?: UuidValueObject;
  description: string;
  quantity: number;
  unitPrice: PaymentAmount;
  totalPrice: PaymentAmount;
  metadata?: Record<string, any>;
}

export class InvoiceItem extends ValueObjectBase<InvoiceItemProps> {
  constructor(props: InvoiceItemProps) {
    if (!props.description || props.description.trim().length === 0) {
      throw new Error('Invoice item description cannot be empty');
    }
    if (props.quantity <= 0) {
      throw new Error('Invoice item quantity must be greater than 0');
    }
    if (props.unitPrice.value <= 0) {
      throw new Error('Invoice item unit price must be greater than 0');
    }
    
    // Validate total price calculation
    const calculatedTotal = props.unitPrice.value * props.quantity;
    if (Math.abs(props.totalPrice.value - calculatedTotal) > 0.01) {
      throw new Error('Invoice item total price does not match quantity * unit price');
    }
    
    super(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get resourceId(): UuidValueObject {
    return this.props.resourceId;
  }

  get resourceItemId(): UuidValueObject | undefined {
    return this.props.resourceItemId;
  }

  get description(): string {
    return this.props.description;
  }

  get quantity(): number {
    return this.props.quantity;
  }

  get unitPrice(): PaymentAmount {
    return this.props.unitPrice;
  }

  get totalPrice(): PaymentAmount {
    return this.props.totalPrice;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  public static create(
    id: UuidValueObject,
    resourceId: UuidValueObject,
    description: string,
    quantity: number,
    unitPrice: number,
    resourceItemId?: UuidValueObject,
    metadata?: Record<string, any>
  ): InvoiceItem {
    const totalPrice = unitPrice * quantity;
    
    return new InvoiceItem({
      id,
      resourceId,
      resourceItemId,
      description,
      quantity,
      unitPrice: PaymentAmount.create(unitPrice),
      totalPrice: PaymentAmount.create(totalPrice),
      metadata,
    });
  }

  public static fromPersistence(props: InvoiceItemProps): InvoiceItem {
    return new InvoiceItem(props);
  }

  public updateQuantity(quantity: number): InvoiceItem {
    if (quantity <= 0) {
      throw new Error('Invoice item quantity must be greater than 0');
    }

    const newTotalPrice = this.props.unitPrice.value * quantity;
    
    return new InvoiceItem({
      ...this.props,
      quantity,
      totalPrice: PaymentAmount.create(newTotalPrice),
    });
  }

  public updateUnitPrice(unitPrice: number): InvoiceItem {
    if (unitPrice <= 0) {
      throw new Error('Invoice item unit price must be greater than 0');
    }

    const newTotalPrice = unitPrice * this.props.quantity;
    
    return new InvoiceItem({
      ...this.props,
      unitPrice: PaymentAmount.create(unitPrice),
      totalPrice: PaymentAmount.create(newTotalPrice),
    });
  }

  public updateDescription(description: string): InvoiceItem {
    if (!description || description.trim().length === 0) {
      throw new Error('Invoice item description cannot be empty');
    }

    return new InvoiceItem({
      ...this.props,
      description: description.trim(),
    });
  }
}
