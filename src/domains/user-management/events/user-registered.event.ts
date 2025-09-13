// src/domains/user-management/events/user-registered.event.ts
import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
export class UserRegistered extends DomainEvent {
  readonly eventName = 'UserRegistered';
  readonly eventVersion = 1;
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(
    public readonly userId: string,
    public readonly email: string
  ) {
    super();
    this.occurredOn = new Date();
    this.aggregateId = userId;
  }
}