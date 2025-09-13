import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ResourceStatus as PrismaResourceStatus, ResourceType as PrismaResourceType } from '@prisma/client';
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
export class PrismaResourceRepository implements ResourceRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: ResourceEntity): Promise<ResourceEntity> {
    const resourceData = {
      id: entity.id.value,
      name: entity.name.value,
      description: entity.description?.value,
      capacity: entity.capacity.value,
      price: entity.price.value,
      currency: entity.price.currency,
      status: entity.status.value as PrismaResourceStatus,
      type: entity.type.value as PrismaResourceType,
      location: entity.location,
      amenities: entity.amenities,
      images: entity.images,
      isActive: entity.isActive,
    };

    const savedResource = await this.prisma.resource.upsert({
      where: { id: resourceData.id },
      create: resourceData,
      update: resourceData,
    });

    return this.toDomainEntity(savedResource);
  }

  async findById(id: UuidValueObject): Promise<ResourceEntity | null> {
    const resource = await this.prisma.resource.findUnique({
      where: { id: id.value },
    });

    return resource ? this.toDomainEntity(resource) : null;
  }

  async findByStatus(status: string): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { status: status as PrismaResourceStatus },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findByType(type: string): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { type: type as PrismaResourceType },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findActiveResources(): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async search(criteria: ResourceSearchCriteria): Promise<ResourceSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const where: any = {};

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

    const total = await this.prisma.resource.count({ where });
    
    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      resources: resources.map(resource => this.toDomainEntity(resource)),
      total,
      page,
      limit,
    };
  }

  async findAvailable(criteria: ResourceAvailabilityCriteria): Promise<ResourceSearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const where: any = {
      isActive: true,
      status: criteria.status || PrismaResourceStatus.AVAILABLE,
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
      resourceItems: {
        some: {
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
        }
      }
    };

    const resources = await this.prisma.resource.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return {
      resources: resources.map(resource => this.toDomainEntity(resource)),
      total: resources.length,
      page,
      limit,
    };
  }

  async findAll(): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findByName(name: string): Promise<ResourceEntity | null> {
    const resource = await this.prisma.resource.findFirst({
      where: { name },
    });

    return resource ? this.toDomainEntity(resource) : null;
  }

  async checkAvailability(
    resourceId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<ResourceAvailabilityResult> {
    // This would check for overlapping bookings
    // For now, return a simple availability check
    const resource = await this.findById(resourceId);
    
    return {
      availableResources: resource ? [resource] : [],
      totalAvailable: resource ? 1 : 0,
      period: {
        startDate,
        endDate,
      },
    };
  }

  async findByLocation(location: string): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { location: { contains: location, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findByAmenities(amenities: string[]): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { 
        amenities: { 
          array_contains: amenities 
        } 
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findByPriceRange(minPrice: number, maxPrice: number): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { 
        price: { 
          gte: minPrice,
          lte: maxPrice
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async findByCapacityRange(minCapacity: number, maxCapacity: number): Promise<ResourceEntity[]> {
    const resources = await this.prisma.resource.findMany({
      where: { 
        capacity: { 
          gte: minCapacity,
          lte: maxCapacity
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return resources.map(resource => this.toDomainEntity(resource));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.resource.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaResource: any): ResourceEntity {
    return ResourceEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaResource.id),
      name: ResourceName.fromPersistence(prismaResource.name),
      description: ResourceDescription.fromPersistence(prismaResource.description),
      capacity: ResourceCapacity.fromPersistence(prismaResource.capacity),
      price: ResourcePrice.fromPersistence(prismaResource.price, prismaResource.currency),
      status: ResourceStatus.fromPersistence(prismaResource.status),
      type: ResourceType.fromPersistence(prismaResource.type),
      location: prismaResource.location,
      amenities: prismaResource.amenities,
      images: prismaResource.images,
      isActive: prismaResource.isActive,
      createdAt: prismaResource.createdAt,
      updatedAt: prismaResource.updatedAt,
    });
  }
}
