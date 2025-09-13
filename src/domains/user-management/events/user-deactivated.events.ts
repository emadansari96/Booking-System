// src/domains/user-management/events/user-deactivated.event.ts
import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
export class UserDeactivated extends DomainEvent {
  readonly eventName = 'UserDeactivated';
  readonly eventVersion = 1;
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(
    public readonly userId: string
  ) {
    super();
    this.occurredOn = new Date();
    this.aggregateId = userId;
  }
}