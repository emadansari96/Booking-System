import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
export class PaymentStatusChangedEvent extends DomainEvent {
  public readonly eventName: string = 'PaymentStatusChanged';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly paymentId: string,
    public readonly newStatus: string,
    public readonly previousStatus: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = paymentId;
  }
}
