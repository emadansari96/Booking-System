import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum BookingStatusEnum {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  PAYMENT_PENDING = 'PAYMENT_PENDING',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
}

export interface BookingStatusProps {
  value: BookingStatusEnum;
}

export class BookingStatus extends ValueObjectBase<BookingStatusProps> {
  constructor(value: BookingStatusEnum) {
    if (!Object.values(BookingStatusEnum).includes(value)) {
      throw new Error(`Invalid booking status: ${value}`);
    }
    super({ value });
  }

  get value(): BookingStatusEnum {
    return this.props.value;
  }

  public static create(value: BookingStatusEnum): BookingStatus {
    return new BookingStatus(value);
  }

  public static fromPersistence(value: string): BookingStatus {
    return new BookingStatus(value as BookingStatusEnum);
  }

  public isPending(): boolean {
    return this.props.value === BookingStatusEnum.PENDING;
  }

  public isConfirmed(): boolean {
    return this.props.value === BookingStatusEnum.CONFIRMED;
  }

  public isCancelled(): boolean {
    return this.props.value === BookingStatusEnum.CANCELLED;
  }

  public isCompleted(): boolean {
    return this.props.value === BookingStatusEnum.COMPLETED;
  }

  public isExpired(): boolean {
    return this.props.value === BookingStatusEnum.EXPIRED;
  }

  public isPaymentPending(): boolean {
    return this.props.value === BookingStatusEnum.PAYMENT_PENDING;
  }

  public isPaymentFailed(): boolean {
    return this.props.value === BookingStatusEnum.PAYMENT_FAILED;
  }

  public canTransitionTo(newStatus: BookingStatusEnum): boolean {
    const currentStatus = this.props.value;
    
    switch (currentStatus) {
      case BookingStatusEnum.PENDING:
        return [BookingStatusEnum.CONFIRMED, BookingStatusEnum.CANCELLED, BookingStatusEnum.EXPIRED, BookingStatusEnum.PAYMENT_PENDING].includes(newStatus);
      case BookingStatusEnum.PAYMENT_PENDING:
        return [BookingStatusEnum.CONFIRMED, BookingStatusEnum.CANCELLED, BookingStatusEnum.EXPIRED, BookingStatusEnum.PAYMENT_FAILED].includes(newStatus);
      case BookingStatusEnum.CONFIRMED:
        return [BookingStatusEnum.COMPLETED, BookingStatusEnum.CANCELLED].includes(newStatus);
      case BookingStatusEnum.COMPLETED:
      case BookingStatusEnum.CANCELLED:
      case BookingStatusEnum.EXPIRED:
      case BookingStatusEnum.PAYMENT_FAILED:
        return false; // Terminal states
      default:
        return false;
    }
  }

  public isActive(): boolean {
    return [BookingStatusEnum.PENDING, BookingStatusEnum.CONFIRMED, BookingStatusEnum.PAYMENT_PENDING].includes(this.props.value);
  }
}
