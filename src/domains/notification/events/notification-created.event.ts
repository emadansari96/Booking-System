import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class NotificationCreatedEvent extends DomainEvent {
  public readonly eventName: string = 'NotificationCreated';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    public readonly priority: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = notificationId;
  }
}
