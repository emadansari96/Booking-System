import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommissionStrategyCreatedEvent } from '../commission-strategy-created.event';

@EventsHandler(CommissionStrategyCreatedEvent)
export class CommissionStrategyCreatedHandler implements IEventHandler<CommissionStrategyCreatedEvent> {
  async handle(event: CommissionStrategyCreatedEvent): Promise<void> {
    console.log(`Commission strategy created: ${event.name} (${event.type}: ${event.value})`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
  }
}
