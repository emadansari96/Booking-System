import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class BookingPaymentPendingEvent extends DomainEvent {
  public readonly eventName: string = 'BookingPaymentPending';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly bookingId: string,
    public readonly userId: string,
    public readonly resourceId: string,
    public readonly resourceItemId: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalPrice: number,
    public readonly currency: string,
    public readonly paymentDeadline: Date,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = bookingId;
  }
}
