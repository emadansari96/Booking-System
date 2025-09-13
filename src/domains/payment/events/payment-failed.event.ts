import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class PaymentFailedEvent extends DomainEvent {
  public readonly eventName: string = 'PaymentFailed';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly paymentId: string,
    public readonly userId: string,
    public readonly invoiceId: string,
    public readonly amount: number,
    public readonly currency: string,
    public readonly reason: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = paymentId;
  }
}
