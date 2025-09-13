import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { ResourceCreatedEvent } from '../resource-created.event';
import { Logger } from '@nestjs/common';

@EventsHandler(ResourceCreatedEvent)
export class ResourceCreatedHandler implements IEventHandler<ResourceCreatedEvent> {
  private readonly logger = new Logger(ResourceCreatedHandler.name);

  async handle(event: ResourceCreatedEvent): Promise<void> {
    this.logger.log(`Resource created: ${event.aggregateId}`, {
      resourceId: event.aggregateId,
      name: event.payload.name,
      type: event.payload.type,
      status: event.payload.status,
    });

    // Here you can add side effects like:
    // - Send notifications
    // - Update search indexes
    // - Log audit events
    // - Send to external systems
  }
}
