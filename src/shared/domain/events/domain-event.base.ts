// src/shared/domain/events/domain-event.base.ts
export abstract class DomainEvent {
  abstract readonly eventName: string;
  abstract readonly occurredOn: Date;
  abstract readonly aggregateId: string;
  abstract readonly eventVersion: number;
}