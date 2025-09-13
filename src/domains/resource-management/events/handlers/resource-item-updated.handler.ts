import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceItemUpdatedEvent } from '../resource-item-updated.event';
@EventsHandler(ResourceItemUpdatedEvent)
export class ResourceItemUpdatedHandler implements IEventHandler<ResourceItemUpdatedEvent> {
  handle(event: ResourceItemUpdatedEvent) {
    console.log(`Resource item updated: ${event.resourceItemId} for resource: ${event.resourceId}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Trigger other domain events
  }
}
