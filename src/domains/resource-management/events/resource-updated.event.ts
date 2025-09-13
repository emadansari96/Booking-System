import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
import { ResourceEntity } from '../entities/resource.entity';
export interface ResourceUpdatedEventPayload {
  id: string;
  name: string;
  description: string;
  capacity: number;
  price: number;
  currency: string;
  status: string;
  type: string;
  location?: string;
  amenities?: string[];
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceUpdatedEvent extends DomainEvent {
  public readonly eventName = 'ResourceUpdated';
  public readonly occurredOn: Date;
  public readonly eventVersion = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly payload: ResourceUpdatedEventPayload
  ) {
    super();
    this.occurredOn = new Date();
  }

  public static fromEntity(resource: ResourceEntity): ResourceUpdatedEvent {
    return new ResourceUpdatedEvent(
      resource.id.value,
      {
        id: resource.id.value,
        name: resource.name.value,
        description: resource.description.value,
        capacity: resource.capacity.value,
        price: resource.price.value,
        currency: resource.price.currency,
        status: resource.status.value,
        type: resource.type.value,
        location: resource.location,
        amenities: resource.amenities,
        images: resource.images,
        createdAt: resource.createdAt,
        updatedAt: resource.updatedAt,
      }
    );
  }
}
