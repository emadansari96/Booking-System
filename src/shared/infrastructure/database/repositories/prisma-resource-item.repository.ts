import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResourceItemRepositoryInterface, ResourceItemSearchCriteria, ResourceItemAvailabilityCriteria, ResourceItemSearchResult, ResourceItemAvailabilityResult } from '../../../../domains/resource-management/interfaces/resource-item-repository.interface';
import { ResourceItemEntity } from '../../../../domains/resource-management/entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemName } from '../../../../domains/resource-management/value-objects/resource-item-name.value-object';
import { ResourceItemStatus, ResourceItemStatusEnum } from '../../../../domains/resource-management/value-objects/resource-item-status.value-object';
import { ResourceItemType, ResourceItemTypeEnum } from '../../../../domains/resource-management/value-objects/resource-item-type.value-object';
import { ResourceCapacity } from '../../../../domains/resource-management/value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../../../../domains/resource-management/value-objects/resource-price.value-object';

@Injectable()
export class PrismaResourceItemRepository implements ResourceItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ResourceItemEntity): Promise<ResourceItemEntity> {
    const resourceItemData = {
      id: entity.id.value,
      resourceId: entity.resourceId.value,
      name: entity.name.value,
      status: entity.status.value,
      type: entity.type.value,
      capacity: entity.capacity.value,
      price: entity.price.value,
      currency: entity.price.currency,
      description: entity.description,
      location: entity.location,
      amenities: entity.amenities,
      images: entity.images,
      isActive: entity.isActive,
    };

    const savedResourceItem = await this.prisma.resourceItem.upsert({
      where: { id: resourceItemData.id },
      create: resourceItemData,
      update: resourceItemData,
    });

    return this.toDomainEntity(savedResourceItem);
  }

  async findById(id: UuidValueObject): Promise<ResourceItemEntity | null> {
    const resourceItem = await this.prisma.resourceItem.findUnique({
      where: { id: id.value },
    });

    return resourceItem ? this.toDomainEntity(resourceItem) : null;
  }

  async findByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { resourceId: resourceId.value },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async findByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { 
        resourceId: resourceId.value,
        status: status as ResourceItemStatusEnum
      },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async findByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { 
        resourceId: resourceId.value,
        type: type as ResourceItemTypeEnum
      },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async findAvailableByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { 
        resourceId: resourceId.value,
        status: ResourceItemStatusEnum.AVAILABLE,
        isActive: true
      },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async searchByCriteria(criteria: ResourceItemSearchCriteria, page: number = 1, limit: number = 10): Promise<ResourceItemSearchResult> {
    const where: any = {};

    if (criteria.resourceId) {
      where.resourceId = criteria.resourceId;
    }
    if (criteria.status) {
      where.status = criteria.status;
    }
    if (criteria.type) {
      where.type = criteria.type;
    }
    if (criteria.isActive !== undefined) {
      where.isActive = criteria.isActive;
    }
    if (criteria.minCapacity !== undefined) {
      where.capacity = { gte: criteria.minCapacity };
    }
    if (criteria.maxCapacity !== undefined) {
      where.capacity = { ...where.capacity, lte: criteria.maxCapacity };
    }
    if (criteria.minPrice !== undefined) {
      where.price = { gte: criteria.minPrice };
    }
    if (criteria.maxPrice !== undefined) {
      where.price = { ...where.price, lte: criteria.maxPrice };
    }
    if (criteria.location) {
      where.location = { contains: criteria.location, mode: 'insensitive' };
    }
    if (criteria.amenities && criteria.amenities.length > 0) {
      where.amenities = { hasSome: criteria.amenities };
    }

    const total = await this.prisma.resourceItem.count({ where });
    
    const resourceItems = await this.prisma.resourceItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items: resourceItems.map(item => this.toDomainEntity(item)),
      total,
      page,
      limit,
    };
  }

  async findAvailableByPeriod(criteria: ResourceItemAvailabilityCriteria): Promise<ResourceItemAvailabilityResult> {
    const where: any = {
      resourceId: criteria.resourceId,
      isActive: true,
      status: criteria.status || ResourceItemStatusEnum.AVAILABLE,
    };

    if (criteria.type) {
      where.type = criteria.type;
    }
    if (criteria.minCapacity !== undefined) {
      where.capacity = { gte: criteria.minCapacity };
    }
    if (criteria.maxCapacity !== undefined) {
      where.capacity = { ...where.capacity, lte: criteria.maxCapacity };
    }
    if (criteria.minPrice !== undefined) {
      where.price = { gte: criteria.minPrice };
    }
    if (criteria.maxPrice !== undefined) {
      where.price = { ...where.price, lte: criteria.maxPrice };
    }

    // Check for overlapping bookings
    where.NOT = {
      bookings: {
        some: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              AND: [
                { startDate: { lte: criteria.startDate } },
                { endDate: { gt: criteria.startDate } }
              ]
            },
            {
              AND: [
                { startDate: { lt: criteria.endDate } },
                { endDate: { gte: criteria.endDate } }
              ]
            },
            {
              AND: [
                { startDate: { gte: criteria.startDate } },
                { endDate: { lte: criteria.endDate } }
              ]
            }
          ]
        }
      }
    };

    const resourceItems = await this.prisma.resourceItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      availableItems: resourceItems.map(item => this.toDomainEntity(item)),
      totalAvailable: resourceItems.length,
      period: {
        startDate: criteria.startDate,
        endDate: criteria.endDate,
      },
    };
  }

  async findByStatus(status: string): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { status: status as ResourceItemStatusEnum },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async findByType(type: string): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { type: type as ResourceItemTypeEnum },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async findActiveItems(): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async countByResourceId(resourceId: UuidValueObject): Promise<number> {
    return this.prisma.resourceItem.count({
      where: { resourceId: resourceId.value }
    });
  }

  async countByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<number> {
    return this.prisma.resourceItem.count({
      where: { 
        resourceId: resourceId.value,
        status: status as ResourceItemStatusEnum
      }
    });
  }

  async countByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<number> {
    return this.prisma.resourceItem.count({
      where: { 
        resourceId: resourceId.value,
        type: type as ResourceItemTypeEnum
      }
    });
  }

  async findAll(): Promise<ResourceItemEntity[]> {
    const resourceItems = await this.prisma.resourceItem.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return resourceItems.map(item => this.toDomainEntity(item));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.resourceItem.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaResourceItem: any): ResourceItemEntity {
    return ResourceItemEntity.fromEntity(new ResourceItemEntity({
      id: UuidValueObject.fromString(prismaResourceItem.id),
      resourceId: UuidValueObject.fromString(prismaResourceItem.resourceId),
      name: new ResourceItemName(prismaResourceItem.name),
      status: new ResourceItemStatus(prismaResourceItem.status as ResourceItemStatusEnum),
      type: new ResourceItemType(prismaResourceItem.type as ResourceItemTypeEnum),
      capacity: ResourceCapacity.create(prismaResourceItem.capacity),
      price: ResourcePrice.create(prismaResourceItem.price, prismaResourceItem.currency),
      description: prismaResourceItem.description,
      location: prismaResourceItem.location,
      amenities: prismaResourceItem.amenities,
      images: prismaResourceItem.images,
      isActive: prismaResourceItem.isActive,
      createdAt: prismaResourceItem.createdAt,
      updatedAt: prismaResourceItem.updatedAt,
    }));
  }
}
