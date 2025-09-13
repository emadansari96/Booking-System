import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceDeletedEvent } from '../resource-deleted.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ResourceDeletedEvent)
export class ResourceDeletedHandler implements IEventHandler<ResourceDeletedEvent> {
  private readonly logger = new Logger(ResourceDeletedHandler.name);

  async handle(event: ResourceDeletedEvent): Promise<void> {
    this.logger.log(`Resource deleted: ${event.aggregateId}`, {
      resourceId: event.aggregateId,
      name: event.payload.name,
      type: event.payload.type,
      deletedAt: event.payload.deletedAt,
    });

    // Here you can add side effects like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Send to external systems
    // - Cancel related bookings
  }
}
