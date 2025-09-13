import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
export class InvoiceRefundedEvent extends DomainEvent {
  public readonly eventName: string = 'InvoiceRefunded';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly invoiceId: string,
    public readonly invoiceNumber: string,
    public readonly userId: string,
    public readonly totalAmount: number,
    public readonly currency: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = invoiceId;
  }
}
