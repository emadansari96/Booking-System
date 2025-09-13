import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemName } from '../value-objects/resource-item-name.value-object';
import { ResourceItemStatus, ResourceItemStatusEnum } from '../value-objects/resource-item-status.value-object';
import { ResourceItemType, ResourceItemTypeEnum } from '../value-objects/resource-item-type.value-object';
import { ResourceCapacity } from '../value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../value-objects/resource-price.value-object';
import { ResourceItemCreatedEvent } from '../events/resource-item-created.event';
import { ResourceItemUpdatedEvent } from '../events/resource-item-updated.event';
import { ResourceItemDeletedEvent } from '../events/resource-item-deleted.event';
import { ResourceItemStatusChangedEvent } from '../events/resource-item-status-changed.event';

export interface ResourceItemProps {
  id: UuidValueObject;
  resourceId: UuidValueObject;
  name: ResourceItemName;
  status: ResourceItemStatus;
  type: ResourceItemType;
  capacity: ResourceCapacity;
  price: ResourcePrice;
  description?: string;
  location?: string;
  amenities?: string[];
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ResourceItemEntity extends AggregateRoot<ResourceItemProps> {
  constructor(props: ResourceItemProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    resourceId: UuidValueObject,
    name: string,
    type: ResourceItemTypeEnum,
    capacity: number,
    price: number,
    currency: string = 'USD',
    status: ResourceItemStatusEnum = ResourceItemStatusEnum.AVAILABLE,
    description?: string,
    location?: string,
    amenities?: string[],
    images?: string[]
  ): ResourceItemEntity {
    const now = new Date();
    const resourceItem = new ResourceItemEntity({
      id,
      resourceId,
      name: new ResourceItemName(name),
      status: new ResourceItemStatus(status),
      type: new ResourceItemType(type),
      capacity: ResourceCapacity.create(capacity),
      price: ResourcePrice.create(price, currency),
      description,
      location,
      amenities: amenities || [],
      images: images || [],
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    resourceItem.addDomainEvent(new ResourceItemCreatedEvent(
      resourceItem.props.id.value,
      resourceItem.props.resourceId.value,
      resourceItem.props.name.value,
      resourceItem.props.type.value,
      resourceItem.props.status.value
    ));

    return resourceItem;
  }

  public static fromEntity(entity: ResourceItemEntity): ResourceItemEntity {
    return new ResourceItemEntity({
      id: entity.props.id,
      resourceId: entity.props.resourceId,
      name: entity.props.name,
      status: entity.props.status,
      type: entity.props.type,
      capacity: entity.props.capacity,
      price: entity.props.price,
      description: entity.props.description,
      location: entity.props.location,
      amenities: entity.props.amenities,
      images: entity.props.images,
      isActive: entity.props.isActive,
      createdAt: entity.props.createdAt,
      updatedAt: entity.props.updatedAt,
    });
  }

  // Getters
  get id(): UuidValueObject {
    return this.props.id;
  }

  get resourceId(): UuidValueObject {
    return this.props.resourceId;
  }

  get name(): ResourceItemName {
    return this.props.name;
  }

  get status(): ResourceItemStatus {
    return this.props.status;
  }

  get type(): ResourceItemType {
    return this.props.type;
  }

  get capacity(): ResourceCapacity {
    return this.props.capacity;
  }

  get price(): ResourcePrice {
    return this.props.price;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get location(): string | undefined {
    return this.props.location;
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

  // Business methods
  public updateDetails(
    name?: string,
    description?: string,
    location?: string,
    amenities?: string[],
    images?: string[]
  ): void {
    const oldName = this.props.name.value;
    
    if (name !== undefined) {
      this.props.name = new ResourceItemName(name);
    }
    if (description !== undefined) {
      this.props.description = description;
    }
    if (location !== undefined) {
      this.props.location = location;
    }
    if (amenities !== undefined) {
      this.props.amenities = amenities;
    }
    if (images !== undefined) {
      this.props.images = images;
    }

    this.props.updatedAt = new Date();

    this.addDomainEvent(new ResourceItemUpdatedEvent(
      this.props.id.value,
      this.props.resourceId.value,
      oldName,
      this.props.name.value,
      this.props.type.value,
      this.props.status.value
    ));
  }

  public changeStatus(newStatus: ResourceItemStatusEnum): void {
    const oldStatus = this.props.status.value;
    this.props.status = new ResourceItemStatus(newStatus);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new ResourceItemStatusChangedEvent(
      this.props.id.value,
      this.props.resourceId.value,
      this.props.name.value,
      oldStatus,
      newStatus
    ));
  }

  public updatePricing(price: number, currency?: string): void {
    this.props.price = ResourcePrice.create(price, currency || this.props.price.currency);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new ResourceItemUpdatedEvent(
      this.props.id.value,
      this.props.resourceId.value,
      this.props.name.value,
      this.props.name.value,
      this.props.type.value,
      this.props.status.value
    ));
  }

  public deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new ResourceItemDeletedEvent(
      this.props.id.value,
      this.props.resourceId.value,
      this.props.name.value,
      this.props.type.value
    ));
  }

  public activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new ResourceItemUpdatedEvent(
      this.props.id.value,
      this.props.resourceId.value,
      this.props.name.value,
      this.props.name.value,
      this.props.type.value,
      this.props.status.value
    ));
  }

  public isAvailable(): boolean {
    return this.props.isActive && this.props.status.isAvailable();
  }

  public canBeBooked(): boolean {
    return this.props.isActive && this.props.status.isAvailable();
  }

  public equals(other: ResourceItemEntity): boolean {
    return this.props.id.equals(other.props.id);
  }
}
