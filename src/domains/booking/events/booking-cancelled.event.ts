import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class BookingCancelledEvent extends DomainEvent {
  public readonly eventName: string = 'BookingCancelled';
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
    public readonly reason?: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = bookingId;
  }
}
