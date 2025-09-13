import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class ResourceItemUpdatedEvent extends DomainEvent {
  public readonly eventName: string = 'ResourceItemUpdated';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly resourceItemId: string,
    public readonly resourceId: string,
    public readonly oldName: string,
    public readonly newName: string,
    public readonly type: string,
    public readonly status: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = resourceItemId;
  }
}
