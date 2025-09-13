import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In, Like } from 'typeorm';
import { ResourceItemRepositoryInterface, ResourceItemSearchCriteria, ResourceItemAvailabilityCriteria, ResourceItemSearchResult, ResourceItemAvailabilityResult } from '../../../../domains/resource-management/interfaces/resource-item-repository.interface';
import { ResourceItemEntity } from '../../../../domains/resource-management/entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemName } from '../../../../domains/resource-management/value-objects/resource-item-name.value-object';
import { ResourceItemStatus, ResourceItemStatusEnum } from '../../../../domains/resource-management/value-objects/resource-item-status.value-object';
import { ResourceItemType, ResourceItemTypeEnum } from '../../../../domains/resource-management/value-objects/resource-item-type.value-object';
import { ResourceCapacity } from '../../../../domains/resource-management/value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../../../../domains/resource-management/value-objects/resource-price.value-object';
import { ResourceItemEntity as TypeOrmResourceItemEntity } from '../entities/resource-item.entity';

@Injectable()
export class TypeOrmResourceItemRepository implements ResourceItemRepositoryInterface {
  constructor(
    @InjectRepository(TypeOrmResourceItemEntity)
    private readonly repository: Repository<TypeOrmResourceItemEntity>,
  ) {}

  async save(entity: ResourceItemEntity): Promise<ResourceItemEntity> {
    const ormEntity = this.toOrmEntity(entity);
    const savedEntity = await this.repository.save(ormEntity);
    return this.toDomainEntity(savedEntity);
  }

  async findById(id: UuidValueObject): Promise<ResourceItemEntity | null> {
    const entity = await this.repository.findOne({ where: { id: id.value } });
    return entity ? this.toDomainEntity(entity) : null;
  }

  async findByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { resourceId: resourceId.value },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { 
        resourceId: resourceId.value,
        status: status
      },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { 
        resourceId: resourceId.value,
        type: type
      },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findAvailableByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { 
        resourceId: resourceId.value,
        status: ResourceItemStatusEnum.AVAILABLE,
        isActive: true
      },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async searchByCriteria(criteria: ResourceItemSearchCriteria, page: number = 1, limit: number = 10): Promise<ResourceItemSearchResult> {
    const queryBuilder = this.repository.createQueryBuilder('resourceItem');

    if (criteria.resourceId) {
      queryBuilder.andWhere('resourceItem.resourceId = :resourceId', { resourceId: criteria.resourceId });
    }

    if (criteria.status) {
      queryBuilder.andWhere('resourceItem.status = :status', { status: criteria.status });
    }

    if (criteria.type) {
      queryBuilder.andWhere('resourceItem.type = :type', { type: criteria.type });
    }

    if (criteria.isActive !== undefined) {
      queryBuilder.andWhere('resourceItem.isActive = :isActive', { isActive: criteria.isActive });
    }

    if (criteria.minCapacity !== undefined) {
      queryBuilder.andWhere('resourceItem.capacity >= :minCapacity', { minCapacity: criteria.minCapacity });
    }

    if (criteria.maxCapacity !== undefined) {
      queryBuilder.andWhere('resourceItem.capacity <= :maxCapacity', { maxCapacity: criteria.maxCapacity });
    }

    if (criteria.minPrice !== undefined) {
      queryBuilder.andWhere('resourceItem.price >= :minPrice', { minPrice: criteria.minPrice });
    }

    if (criteria.maxPrice !== undefined) {
      queryBuilder.andWhere('resourceItem.price <= :maxPrice', { maxPrice: criteria.maxPrice });
    }

    if (criteria.location) {
      queryBuilder.andWhere('resourceItem.location ILIKE :location', { location: `%${criteria.location}%` });
    }

    if (criteria.amenities && criteria.amenities.length > 0) {
      queryBuilder.andWhere('resourceItem.amenities && :amenities', { amenities: criteria.amenities });
    }

    const total = await queryBuilder.getCount();
    
    const entities = await queryBuilder
      .orderBy('resourceItem.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      items: entities.map(entity => this.toDomainEntity(entity)),
      total,
      page,
      limit,
    };
  }

  async findAvailableByPeriod(criteria: ResourceItemAvailabilityCriteria): Promise<ResourceItemAvailabilityResult> {
    const queryBuilder = this.repository.createQueryBuilder('resourceItem');

    queryBuilder.andWhere('resourceItem.resourceId = :resourceId', { resourceId: criteria.resourceId });
    queryBuilder.andWhere('resourceItem.isActive = :isActive', { isActive: true });
    queryBuilder.andWhere('resourceItem.status = :status', { status: criteria.status || ResourceItemStatusEnum.AVAILABLE });

    if (criteria.type) {
      queryBuilder.andWhere('resourceItem.type = :type', { type: criteria.type });
    }

    if (criteria.minCapacity !== undefined) {
      queryBuilder.andWhere('resourceItem.capacity >= :minCapacity', { minCapacity: criteria.minCapacity });
    }

    if (criteria.maxCapacity !== undefined) {
      queryBuilder.andWhere('resourceItem.capacity <= :maxCapacity', { maxCapacity: criteria.maxCapacity });
    }

    if (criteria.minPrice !== undefined) {
      queryBuilder.andWhere('resourceItem.price >= :minPrice', { minPrice: criteria.minPrice });
    }

    if (criteria.maxPrice !== undefined) {
      queryBuilder.andWhere('resourceItem.price <= :maxPrice', { maxPrice: criteria.maxPrice });
    }

    // Use GIST index for range queries
    queryBuilder.andWhere(`
      NOT EXISTS (
        SELECT 1 FROM bookings b 
        WHERE b.resource_item_id = resourceItem.id 
        AND b.status IN ('CONFIRMED', 'PENDING')
        AND (
          (b.start_date <= :startDate AND b.end_date > :startDate) OR
          (b.start_date < :endDate AND b.end_date >= :endDate) OR
          (b.start_date >= :startDate AND b.end_date <= :endDate)
        )
      )
    `, { 
      startDate: criteria.startDate, 
      endDate: criteria.endDate 
    });

    const entities = await queryBuilder
      .orderBy('resourceItem.createdAt', 'DESC')
      .getMany();

    return {
      availableItems: entities.map(entity => this.toDomainEntity(entity)),
      totalAvailable: entities.length,
      period: {
        startDate: criteria.startDate,
        endDate: criteria.endDate,
      },
    };
  }

  async findByStatus(status: string): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { status },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findByType(type: string): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { type },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async findActiveItems(): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ 
      where: { isActive: true },
      order: { createdAt: 'DESC' }
    });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async countByResourceId(resourceId: UuidValueObject): Promise<number> {
    return this.repository.count({ where: { resourceId: resourceId.value } });
  }

  async countByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<number> {
    return this.repository.count({ 
      where: { 
        resourceId: resourceId.value,
        status 
      } 
    });
  }

  async countByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<number> {
    return this.repository.count({ 
      where: { 
        resourceId: resourceId.value,
        type 
      } 
    });
  }

  async findAll(): Promise<ResourceItemEntity[]> {
    const entities = await this.repository.find({ order: { createdAt: 'DESC' } });
    return entities.map(entity => this.toDomainEntity(entity));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.repository.delete(id.value);
  }

  private toOrmEntity(domainEntity: ResourceItemEntity): TypeOrmResourceItemEntity {
    const ormEntity = new TypeOrmResourceItemEntity();
    ormEntity.id = domainEntity.id.value;
    ormEntity.resourceId = domainEntity.resourceId.value;
    ormEntity.name = domainEntity.name.value;
    ormEntity.status = domainEntity.status.value;
    ormEntity.type = domainEntity.type.value;
    ormEntity.capacity = domainEntity.capacity.value;
    ormEntity.price = domainEntity.price.value;
    ormEntity.currency = domainEntity.price.currency;
    ormEntity.description = domainEntity.description;
    ormEntity.location = domainEntity.location;
    ormEntity.amenities = domainEntity.amenities;
    ormEntity.images = domainEntity.images;
    ormEntity.isActive = domainEntity.isActive;
    ormEntity.createdAt = domainEntity.createdAt;
    ormEntity.updatedAt = domainEntity.updatedAt;
    return ormEntity;
  }

  private toDomainEntity(ormEntity: TypeOrmResourceItemEntity): ResourceItemEntity {
    return ResourceItemEntity.fromEntity(new ResourceItemEntity({
      id: UuidValueObject.fromString(ormEntity.id),
      resourceId: UuidValueObject.fromString(ormEntity.resourceId),
      name: new ResourceItemName(ormEntity.name),
      status: new ResourceItemStatus(ormEntity.status as ResourceItemStatusEnum),
      type: new ResourceItemType(ormEntity.type as ResourceItemTypeEnum),
      capacity: ResourceCapacity.create(ormEntity.capacity),
      price: ResourcePrice.create(ormEntity.price, ormEntity.currency),
      description: ormEntity.description,
      location: ormEntity.location,
      amenities: ormEntity.amenities,
      images: ormEntity.images,
      isActive: ormEntity.isActive,
      createdAt: ormEntity.createdAt,
      updatedAt: ormEntity.updatedAt,
    }));
  }
}
