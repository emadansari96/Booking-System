import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class InvoiceStatusChangedEvent extends DomainEvent {
  public readonly eventName: string = 'InvoiceStatusChanged';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly invoiceId: string,
    public readonly newStatus: string,
    public readonly previousStatus: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = invoiceId;
  }
}
