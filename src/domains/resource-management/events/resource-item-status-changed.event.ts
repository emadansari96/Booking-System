import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class ResourceItemStatusChangedEvent extends DomainEvent {
  public readonly eventName: string = 'ResourceItemStatusChanged';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly resourceItemId: string,
    public readonly resourceId: string,
    public readonly name: string,
    public readonly oldStatus: string,
    public readonly newStatus: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = resourceItemId;
  }
}
