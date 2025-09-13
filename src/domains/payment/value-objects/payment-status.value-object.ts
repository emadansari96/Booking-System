import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface PaymentStatusProps {
  value: PaymentStatusEnum;
}

export class PaymentStatus extends ValueObjectBase<PaymentStatusProps> {
  constructor(value: PaymentStatusEnum) {
    if (!Object.values(PaymentStatusEnum).includes(value)) {
      throw new Error(`Invalid payment status: ${value}`);
    }
    super({ value });
  }

  get value(): PaymentStatusEnum {
    return this.props.value;
  }

  public static create(value: PaymentStatusEnum): PaymentStatus {
    return new PaymentStatus(value);
  }

  public static fromPersistence(value: string): PaymentStatus {
    return new PaymentStatus(value as PaymentStatusEnum);
  }

  public isPending(): boolean {
    return this.props.value === PaymentStatusEnum.PENDING;
  }

  public isApproved(): boolean {
    return this.props.value === PaymentStatusEnum.APPROVED;
  }

  public isCompleted(): boolean {
    return this.props.value === PaymentStatusEnum.COMPLETED;
  }

  public isFailed(): boolean {
    return this.props.value === PaymentStatusEnum.FAILED;
  }

  public isCancelled(): boolean {
    return this.props.value === PaymentStatusEnum.CANCELLED;
  }

  public isRefunded(): boolean {
    return this.props.value === PaymentStatusEnum.REFUNDED;
  }

  public canTransitionTo(newStatus: PaymentStatusEnum): boolean {
    const currentStatus = this.props.value;
    
    switch (currentStatus) {
      case PaymentStatusEnum.PENDING:
        return [PaymentStatusEnum.APPROVED, PaymentStatusEnum.FAILED, PaymentStatusEnum.CANCELLED].includes(newStatus);
      case PaymentStatusEnum.APPROVED:
        return [PaymentStatusEnum.COMPLETED, PaymentStatusEnum.FAILED, PaymentStatusEnum.CANCELLED].includes(newStatus);
      case PaymentStatusEnum.COMPLETED:
        return [PaymentStatusEnum.REFUNDED].includes(newStatus);
      case PaymentStatusEnum.FAILED:
      case PaymentStatusEnum.CANCELLED:
      case PaymentStatusEnum.REFUNDED:
        return false; // Terminal states
      default:
        return false;
    }
  }
}
