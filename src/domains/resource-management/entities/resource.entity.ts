import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceName } from '../value-objects/resource-name.value-object';
import { ResourceDescription } from '../value-objects/resource-description.value-object';
import { ResourceCapacity } from '../value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../value-objects/resource-price.value-object';
import { ResourceStatus } from '../value-objects/resource-status.value-object';
import { ResourceType } from '../value-objects/resource-type.value-object';
import { ResourceCreatedEvent } from '../events/resource-created.event';
import { ResourceUpdatedEvent } from '../events/resource-updated.event';
import { ResourceDeletedEvent } from '../events/resource-deleted.event';

export interface ResourceProps {
  id: UuidValueObject;
  name: ResourceName;
  description: ResourceDescription;
  capacity: ResourceCapacity;
  price: ResourcePrice;
  status: ResourceStatus;
  type: ResourceType;
  location?: string;
  amenities?: string[];
  images?: string[];
  currency?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceEntity extends AggregateRoot<ResourceProps> {
  private constructor(props: ResourceProps) {
    super(props);
  }

  public static create(props: Omit<ResourceProps, 'id' | 'createdAt' | 'updatedAt'>): ResourceEntity {
    const resource = new ResourceEntity({
      ...props,
      id: UuidValueObject.generate(),
      isActive: props.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    resource.addDomainEvent(ResourceCreatedEvent.fromEntity(resource));
    return resource;
  }

  public static fromPersistence(props: ResourceProps): ResourceEntity {
    return new ResourceEntity(props);
  }

  public static fromEntity(entity: ResourceEntity): ResourceEntity {
    return new ResourceEntity({
      id: entity.props.id,
      name: entity.props.name,
      description: entity.props.description,
      capacity: entity.props.capacity,
      price: entity.props.price,
      status: entity.props.status,
      type: entity.props.type,
      location: entity.props.location,
      amenities: entity.props.amenities,
      images: entity.props.images,
      isActive: entity.props.isActive,
      createdAt: entity.props.createdAt,
      updatedAt: entity.props.updatedAt,
    });
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get name(): ResourceName {
    return this.props.name;
  }

  get description(): ResourceDescription {
    return this.props.description;
  }

  get capacity(): ResourceCapacity {
    return this.props.capacity;
  }

  get price(): ResourcePrice {
    return this.props.price;
  }

  get status(): ResourceStatus {
    return this.props.status;
  }

  get type(): ResourceType {
    return this.props.type;
  }

  get location(): string | undefined {
    return this.props.location;
  }

  get currency(): string | undefined {
    return this.props.currency;
  }

  get amenities(): string[] {
    return this.props.amenities || [];
  }

  get images(): string[] {
    return this.props.images || [];
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateName(name: ResourceName): void {
    this.props.name = name;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateDescription(description: ResourceDescription): void {
    this.props.description = description;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateCapacity(capacity: ResourceCapacity): void {
    this.props.capacity = capacity;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updatePrice(price: ResourcePrice): void {
    this.props.price = price;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateStatus(status: ResourceStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateLocation(location: string): void {
    this.props.location = location;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateAmenities(amenities: string[]): void {
    this.props.amenities = amenities;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public updateImages(images: string[]): void {
    this.props.images = images;
    this.props.updatedAt = new Date();
    this.addDomainEvent(ResourceUpdatedEvent.fromEntity(this));
  }

  public delete(): void {
    this.addDomainEvent(ResourceDeletedEvent.fromEntity(this));
  }

  public isAvailable(): boolean {
    return this.props.status.value === 'AVAILABLE';
  }

  public isBooked(): boolean {
    return this.props.status.value === 'BOOKED';
  }

  public isMaintenance(): boolean {
    return this.props.status.value === 'MAINTENANCE';
  }

  public isUnavailable(): boolean {
    return this.props.status.value === 'UNAVAILABLE';
  }
}
