import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class NotificationCancelledEvent extends DomainEvent {
  public readonly eventName: string = 'NotificationCancelled';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly notificationId: string,
    public readonly userId: string,
    public readonly type: string,
    public readonly title: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = notificationId;
  }
}
