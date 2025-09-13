import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceItemStatusChangedEvent } from '../resource-item-status-changed.event';

@EventsHandler(ResourceItemStatusChangedEvent)
export class ResourceItemStatusChangedHandler implements IEventHandler<ResourceItemStatusChangedEvent> {
  handle(event: ResourceItemStatusChangedEvent) {
    console.log(`Resource item status changed: ${event.resourceItemId} from ${event.oldStatus} to ${event.newStatus}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Trigger other domain events
  }
}
