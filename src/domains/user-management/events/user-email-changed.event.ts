// src/domains/user-management/events/user-email-changed.event.ts
import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class UserEmailChanged extends DomainEvent {
  readonly eventName = 'UserEmailChanged';
  readonly eventVersion = 1;
  readonly occurredOn: Date;
  readonly aggregateId: string;

  constructor(
    public readonly userId: string,
    public readonly newEmail: string
  ) {
    super();
    this.occurredOn = new Date();
    this.aggregateId = userId;
  }
}