import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceItemDeletedEvent } from '../resource-item-deleted.event';
@EventsHandler(ResourceItemDeletedEvent)
export class ResourceItemDeletedHandler implements IEventHandler<ResourceItemDeletedEvent> {
  handle(event: ResourceItemDeletedEvent) {
    console.log(`Resource item deleted: ${event.resourceItemId} for resource: ${event.resourceId}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Trigger other domain events
  }
}
