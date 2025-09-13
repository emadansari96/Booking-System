import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommissionStrategyActivatedEvent } from '../commission-strategy-activated.event';

@EventsHandler(CommissionStrategyActivatedEvent)
export class CommissionStrategyActivatedHandler implements IEventHandler<CommissionStrategyActivatedEvent> {
  async handle(event: CommissionStrategyActivatedEvent): Promise<void> {
    console.log(`Commission strategy activated: ${event.name}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
  }
}
