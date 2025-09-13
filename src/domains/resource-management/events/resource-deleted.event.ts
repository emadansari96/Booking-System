import { DomainEvent } from '../../../shared/domain/events/domain-event.base';
import { ResourceEntity } from '../entities/resource.entity';
export interface ResourceDeletedEventPayload {
  id: string;
  name: string;
  type: string;
  deletedAt: Date;
}

export class ResourceDeletedEvent extends DomainEvent {
  public readonly eventName = 'ResourceDeleted';
  public readonly occurredOn: Date;
  public readonly eventVersion = 1;

  constructor(
    public readonly aggregateId: string,
    public readonly payload: ResourceDeletedEventPayload
  ) {
    super();
    this.occurredOn = new Date();
  }

  public static fromEntity(resource: ResourceEntity): ResourceDeletedEvent {
    return new ResourceDeletedEvent(
      resource.id.value,
      {
        id: resource.id.value,
        name: resource.name.value,
        type: resource.type.value,
        deletedAt: new Date(),
      }
    );
  }
}
