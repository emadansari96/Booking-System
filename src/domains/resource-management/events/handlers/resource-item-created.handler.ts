import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceItemCreatedEvent } from '../resource-item-created.event';
@EventsHandler(ResourceItemCreatedEvent)
export class ResourceItemCreatedHandler implements IEventHandler<ResourceItemCreatedEvent> {
  handle(event: ResourceItemCreatedEvent) {
    console.log(`Resource item created: ${event.resourceItemId} for resource: ${event.resourceId}`);
    // Here you can add additional logic like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Trigger other domain events
  }
}
