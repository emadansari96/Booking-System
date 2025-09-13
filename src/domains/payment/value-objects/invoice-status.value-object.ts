import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';
export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface InvoiceStatusProps {
  value: InvoiceStatusEnum;
}

export class InvoiceStatus extends ValueObjectBase<InvoiceStatusProps> {
  constructor(value: InvoiceStatusEnum) {
    if (!Object.values(InvoiceStatusEnum).includes(value)) {
      throw new Error(`Invalid invoice status: ${value}`);
    }
    super({ value });
  }

  get value(): InvoiceStatusEnum {
    return this.props.value;
  }

  public static create(value: InvoiceStatusEnum): InvoiceStatus {
    return new InvoiceStatus(value);
  }

  public static fromPersistence(value: string): InvoiceStatus {
    return new InvoiceStatus(value as InvoiceStatusEnum);
  }

  public isDraft(): boolean {
    return this.props.value === InvoiceStatusEnum.DRAFT;
  }

  public isPending(): boolean {
    return this.props.value === InvoiceStatusEnum.PENDING;
  }

  public isPaid(): boolean {
    return this.props.value === InvoiceStatusEnum.PAID;
  }

  public isOverdue(): boolean {
    return this.props.value === InvoiceStatusEnum.OVERDUE;
  }

  public isCancelled(): boolean {
    return this.props.value === InvoiceStatusEnum.CANCELLED;
  }

  public isRefunded(): boolean {
    return this.props.value === InvoiceStatusEnum.REFUNDED;
  }

  public canTransitionTo(newStatus: InvoiceStatusEnum): boolean {
    const currentStatus = this.props.value;
    
    switch (currentStatus) {
      case InvoiceStatusEnum.DRAFT:
        return [InvoiceStatusEnum.PENDING, InvoiceStatusEnum.CANCELLED].includes(newStatus);
      case InvoiceStatusEnum.PENDING:
        return [InvoiceStatusEnum.PAID, InvoiceStatusEnum.OVERDUE, InvoiceStatusEnum.CANCELLED].includes(newStatus);
      case InvoiceStatusEnum.PAID:
        return [InvoiceStatusEnum.REFUNDED].includes(newStatus);
      case InvoiceStatusEnum.OVERDUE:
        return [InvoiceStatusEnum.PAID, InvoiceStatusEnum.CANCELLED].includes(newStatus);
      case InvoiceStatusEnum.CANCELLED:
      case InvoiceStatusEnum.REFUNDED:
        return false; // Terminal states
      default:
        return false;
    }
  }
}
