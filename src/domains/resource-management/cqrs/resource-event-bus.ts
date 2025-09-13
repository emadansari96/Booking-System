import { Injectable } from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';
import { ResourceCreatedEvent } from '../events/resource-created.event';
import { ResourceUpdatedEvent } from '../events/resource-updated.event';
import { ResourceDeletedEvent } from '../events/resource-deleted.event';
@Injectable()
export class ResourceEventBus {
  constructor(private readonly eventBus: EventBus) {}

  async publishResourceCreated(event: ResourceCreatedEvent): Promise<void> {
    this.eventBus.publish(event);
  }

  async publishResourceUpdated(event: ResourceUpdatedEvent): Promise<void> {
    this.eventBus.publish(event);
  }

  async publishResourceDeleted(event: ResourceDeletedEvent): Promise<void> {
    this.eventBus.publish(event);
  }
}
