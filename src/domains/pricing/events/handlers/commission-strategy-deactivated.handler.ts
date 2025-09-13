import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { CommissionStrategyDeactivatedEvent } from '../commission-strategy-deactivated.event';

@EventsHandler(CommissionStrategyDeactivatedEvent)
export class CommissionStrategyDeactivatedHandler implements IEventHandler<CommissionStrategyDeactivatedEvent> {
  async handle(event: CommissionStrategyDeactivatedEvent): Promise<void> {
    console.log(`Commission strategy deactivated: ${event.name}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update analytics
    // - Log to audit system
  }
}
