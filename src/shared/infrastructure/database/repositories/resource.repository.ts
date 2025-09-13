import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, In } from 'typeorm';
import { ResourceEntity as TypeOrmResourceEntity } from '../entities/resource.entity';
import { ResourceRepositoryInterface, ResourceSearchCriteria, ResourceAvailabilityCriteria, ResourceSearchResult, ResourceAvailabilityResult } from '../../../../domains/resource-management/interfaces/resource-repository.interface';
import { ResourceEntity } from '../../../../domains/resource-management/entities/resource.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceName } from '../../../../domains/resource-management/value-objects/resource-name.value-object';
import { ResourceDescription } from '../../../../domains/resource-management/value-objects/resource-description.value-object';
import { ResourceCapacity } from '../../../../domains/resource-management/value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../../../../domains/resource-management/value-objects/resource-price.value-object';
import { ResourceStatus } from '../../../../domains/resource-management/value-objects/resource-status.value-object';
import { ResourceType } from '../../../../domains/resource-management/value-objects/resource-type.value-object';

@Injectable()
export class TypeOrmResourceRepository implements ResourceRepositoryInterface {
  constructor(
    @InjectRepository(TypeOrmResourceEntity)
    private readonly repository: Repository<TypeOrmResourceEntity>,
  ) {}

  async save(entity: ResourceEntity): Promise<ResourceEntity> {
    const ormEntity = this.toOrmEntity(entity);
    const saved = await this.repository.save(ormEntity);
    return this.toDomainEntity(saved);
  }

  async findById(id: UuidValueObject): Promise<ResourceEntity | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByName(name: string): Promise<ResourceEntity | null> {
    const entity = await this.repository.findOne({ where: { name } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async search(criteria: ResourceSearchCriteria): Promise<ResourceSearchResult> {
    const queryBuilder = this.repository.createQueryBuilder('resource');

    if (criteria.name) {
      queryBuilder.andWhere('resource.name ILIKE :name', { name: `%${criteria.name}%` });
    }

    if (criteria.type) {
      queryBuilder.andWhere('resource.type = :type', { type: criteria.type });
    }

    if (criteria.status) {
      queryBuilder.andWhere('resource.status = :status', { status: criteria.status });
    }

    if (criteria.minCapacity) {
      queryBuilder.andWhere('resource.capacity >= :minCapacity', { minCapacity: criteria.minCapacity });
    }

    if (criteria.maxCapacity) {
      queryBuilder.andWhere('resource.capacity <= :maxCapacity', { maxCapacity: criteria.maxCapacity });
    }

    if (criteria.minPrice) {
      queryBuilder.andWhere('resource.price >= :minPrice', { minPrice: criteria.minPrice });
    }

    if (criteria.maxPrice) {
      queryBuilder.andWhere('resource.price <= :maxPrice', { maxPrice: criteria.maxPrice });
    }

    if (criteria.location) {
      queryBuilder.andWhere('resource.location ILIKE :location', { location: `%${criteria.location}%` });
    }

    if (criteria.amenities && criteria.amenities.length > 0) {
      queryBuilder.andWhere('resource.amenities && :amenities', { amenities: criteria.amenities });
    }

    // Sorting
    const sortBy = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'DESC';
    queryBuilder.orderBy(`resource.${sortBy}`, sortOrder);

    // Pagination
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      resources: entities.map(entity => this.toDomainEntity(entity)),
      total,
      page: criteria.page || 1,
      limit: criteria.limit || 10,
    };
  }

  async findAvailable(criteria: ResourceAvailabilityCriteria): Promise<ResourceSearchResult> {
    const queryBuilder = this.repository.createQueryBuilder('resource');

    // Only available resources
    queryBuilder.andWhere('resource.status = :status', { status: 'AVAILABLE' });

    if (criteria.type) {
      queryBuilder.andWhere('resource.type = :type', { type: criteria.type });
    }

    if (criteria.minCapacity) {
      queryBuilder.andWhere('resource.capacity >= :minCapacity', { minCapacity: criteria.minCapacity });
    }

    if (criteria.maxCapacity) {
      queryBuilder.andWhere('resource.capacity <= :maxCapacity', { maxCapacity: criteria.maxCapacity });
    }

    if (criteria.minPrice) {
      queryBuilder.andWhere('resource.price >= :minPrice', { minPrice: criteria.minPrice });
    }

    if (criteria.maxPrice) {
      queryBuilder.andWhere('resource.price <= :maxPrice', { maxPrice: criteria.maxPrice });
    }

    if (criteria.location) {
      queryBuilder.andWhere('resource.location ILIKE :location', { location: `%${criteria.location}%` });
    }

    if (criteria.amenities && criteria.amenities.length > 0) {
      queryBuilder.andWhere('resource.amenities && :amenities', { amenities: criteria.amenities });
    }

    // TODO: Add date availability check when booking system is implemented
    // This would involve checking for conflicting bookings

    // Sorting
    const sortBy = criteria.sortBy || 'createdAt';
    const sortOrder = criteria.sortOrder || 'DESC';
    queryBuilder.orderBy(`resource.${sortBy}`, sortOrder);

    // Pagination
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [entities, total] = await queryBuilder.getManyAndCount();

    return {
      resources: entities.map(entity => this.toDomainEntity(entity)),
      total,
      page: criteria.page || 1,
      limit: criteria.limit || 10,
    };
  }

  async checkAvailability(
    resourceId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<ResourceAvailabilityResult> {
    // TODO: Implement actual availability checking when booking system is ready
    // This would involve checking for conflicting bookings in the date range
    
    const resource = await this.findById(resourceId);
    if (!resource) {
      return {
        availableResources: [],
        totalAvailable: 0,
        period: {
          startDate,
          endDate,
        },
      };
    }

    // For now, just return that the resource is available if it's in AVAILABLE status
    return {
      availableResources: resource.isAvailable() ? [resource] : [],
      totalAvailable: resource.isAvailable() ? 1 : 0,
      period: {
        startDate,
        endDate,
      },
    };
  }

  async findByType(type: string): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ where: { type: type as any } });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByStatus(status: string): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ where: { status: status as any } });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByLocation(location: string): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ 
      where: { location: Like(`%${location}%`) } 
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByAmenities(amenities: string[]): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ 
      where: { amenities: In(amenities) } 
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ 
      where: { 
        price: Between(minPrice, maxPrice) 
      } 
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByCapacityRange(minCapacity: number, maxCapacity: number): Promise<ResourceEntity[]> {
    const entities = await this.repository.find({ 
      where: { 
        capacity: Between(minCapacity, maxCapacity) 
      } 
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findAll(): Promise<ResourceEntity[]> {
    const entities = await this.repository.find();
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.repository.delete(id.value);
  }

  private toOrmEntity(domainEntity: ResourceEntity): TypeOrmResourceEntity {
    const ormEntity = new TypeOrmResourceEntity();
    ormEntity.id = domainEntity.id.value;
    ormEntity.name = domainEntity.name.value;
    ormEntity.description = domainEntity.description.value;
    ormEntity.capacity = domainEntity.capacity.value;
    ormEntity.price = domainEntity.price.value;
    ormEntity.currency = domainEntity.price.currency;
    ormEntity.status = domainEntity.status.value;
    ormEntity.type = domainEntity.type.value;
    ormEntity.location = domainEntity.location;
    ormEntity.amenities = domainEntity.amenities;
    ormEntity.images = domainEntity.images;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }

  private toDomainEntity(ormEntity: TypeOrmResourceEntity): ResourceEntity {
    return ResourceEntity.fromPersistence({
      id: UuidValueObject.fromString(ormEntity.id),
      name: ResourceName.fromPersistence(ormEntity.name),
      description: ResourceDescription.fromPersistence(ormEntity.description),
      capacity: ResourceCapacity.fromPersistence(ormEntity.capacity),
      price: ResourcePrice.fromPersistence(ormEntity.price, ormEntity.currency),
      status: ResourceStatus.fromPersistence(ormEntity.status),
      type: ResourceType.fromPersistence(ormEntity.type),
      location: ormEntity.location,
      amenities: ormEntity.amenities,
      images: ormEntity.images,
      isActive: ormEntity.isActive,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    });
  }
}
