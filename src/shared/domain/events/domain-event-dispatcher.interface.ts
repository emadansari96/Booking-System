// src/shared/domain/events/domain-event-dispatcher.interface.ts
import { DomainEventHandler } from './domain-event-handler.interface';
import { DomainEvent } from './domain-event.base';

export interface DomainEventDispatcher {
  dispatch(event: DomainEvent): Promise<void>;
  registerHandler<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void;
}