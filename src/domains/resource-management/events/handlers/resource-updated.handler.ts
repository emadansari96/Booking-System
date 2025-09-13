import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceUpdatedEvent } from '../resource-updated.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ResourceUpdatedEvent)
export class ResourceUpdatedHandler implements IEventHandler<ResourceUpdatedEvent> {
  private readonly logger = new Logger(ResourceUpdatedHandler.name);

  async handle(event: ResourceUpdatedEvent): Promise<void> {
    this.logger.log(`Resource updated: ${event.aggregateId}`, {
      resourceId: event.aggregateId,
      name: event.payload.name,
      type: event.payload.type,
      status: event.payload.status,
      updatedAt: event.payload.updatedAt,
    });

    // Here you can add side effects like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Send to external systems
  }
}
