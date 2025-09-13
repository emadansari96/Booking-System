import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommissionStrategyUpdatedEvent } from '../commission-strategy-updated.event';

@EventsHandler(CommissionStrategyUpdatedEvent)
export class CommissionStrategyUpdatedHandler implements IEventHandler<CommissionStrategyUpdatedEvent> {
  async handle(event: CommissionStrategyUpdatedEvent): Promise<void> {
    console.log(`Commission strategy updated: ${event.name} (${event.type}: ${event.value})`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
  }
}
