import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CommissionStrategyRepositoryInterface, CommissionStrategySearchCriteria, CommissionStrategySearchResult } from '../../../../domains/pricing/interfaces/commission-strategy-repository.interface';
import { CommissionStrategyEntity } from '../../../../domains/pricing/entities/commission-strategy.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { CommissionName } from '../../../../domains/pricing/value-objects/commission-name.value-object';
import { CommissionType } from '../../../../domains/pricing/value-objects/commission-type.value-object';
import { CommissionValue } from '../../../../domains/pricing/value-objects/commission-value.value-object';
import { CommissionType as PrismaCommissionType } from '@prisma/client';

@Injectable()
export class PrismaCommissionStrategyRepository implements CommissionStrategyRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: CommissionStrategyEntity): Promise<CommissionStrategyEntity> {
    const strategyData = {
      id: entity.id.value,
      name: entity.name.value,
      type: entity.type.value as PrismaCommissionType,
      value: entity.value.value,
      description: entity.description,
      isActive: entity.isActive,
      priority: entity.priority,
      applicableResourceTypes: entity.applicableResourceTypes,
      minBookingDuration: entity.minBookingDuration,
      maxBookingDuration: entity.maxBookingDuration,
    };

    const savedStrategy = await this.prisma.commissionStrategy.upsert({
      where: { id: strategyData.id },
      create: strategyData,
      update: strategyData,
    });

    return this.toDomainEntity(savedStrategy);
  }

  async findById(id: UuidValueObject): Promise<CommissionStrategyEntity | null> {
    const strategy = await this.prisma.commissionStrategy.findUnique({
      where: { id: id.value },
    });

    return strategy ? this.toDomainEntity(strategy) : null;
  }

  async findByName(name: string): Promise<CommissionStrategyEntity | null> {
    const strategy = await this.prisma.commissionStrategy.findUnique({
      where: { name },
    });

    return strategy ? this.toDomainEntity(strategy) : null;
  }

  async findActiveStrategies(): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findStrategiesByType(type: string): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: { type: type as PrismaCommissionType },
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findStrategiesByResourceType(resourceType: string): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: {
        isActive: true,
        OR: [
          { applicableResourceTypes: { equals: [] } }, // Empty array means applies to all
          { applicableResourceTypes: { array_contains: [resourceType] } }
        ]
      },
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findStrategiesByPriority(priority: number): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: { priority },
      orderBy: { createdAt: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findHighestPriorityStrategy(resourceType: string, bookingDurationHours: number): Promise<CommissionStrategyEntity | null> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: {
        isActive: true,
        OR: [
          { applicableResourceTypes: { equals: [] } }, // Empty array means applies to all
          { applicableResourceTypes: { array_contains: [resourceType] } }
        ],
        AND: [
          {
            OR: [
              { minBookingDuration: null },
              { minBookingDuration: { lte: bookingDurationHours } }
            ]
          },
          {
            OR: [
              { maxBookingDuration: null },
              { maxBookingDuration: { gte: bookingDurationHours } }
            ]
          }
        ]
      },
      orderBy: { priority: 'desc' },
      take: 1,
    });

    return strategies.length > 0 ? this.toDomainEntity(strategies[0]) : null;
  }

  async search(criteria: CommissionStrategySearchCriteria): Promise<CommissionStrategySearchResult> {
    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const where: any = {};

    if (criteria.name) {
      where.name = { contains: criteria.name, mode: 'insensitive' };
    }
    if (criteria.type) {
      where.type = criteria.type as PrismaCommissionType;
    }
    if (criteria.isActive !== undefined) {
      where.isActive = criteria.isActive;
    }
    if (criteria.priority !== undefined) {
      where.priority = criteria.priority;
    }
    if (criteria.applicableResourceTypes && criteria.applicableResourceTypes.length > 0) {
      where.OR = [
        { applicableResourceTypes: { equals: [] } },
        { applicableResourceTypes: { array_contains: criteria.applicableResourceTypes } }
      ];
    }
    if (criteria.minValue !== undefined) {
      where.value = { gte: criteria.minValue };
    }
    if (criteria.maxValue !== undefined) {
      where.value = { ...where.value, lte: criteria.maxValue };
    }

    const total = await this.prisma.commissionStrategy.count({ where });
    
    const strategies = await this.prisma.commissionStrategy.findMany({
      where,
      orderBy: { priority: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      strategies: strategies.map(strategy => this.toDomainEntity(strategy)),
      total,
      page,
      limit,
    };
  }

  async findByValueRange(minValue: number, maxValue: number): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: { 
        value: { 
          gte: minValue,
          lte: maxValue
        }
      },
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findStrategiesByBookingDuration(bookingDurationHours: number): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      where: {
        isActive: true,
        AND: [
          {
            OR: [
              { minBookingDuration: null },
              { minBookingDuration: { lte: bookingDurationHours } }
            ]
          },
          {
            OR: [
              { maxBookingDuration: null },
              { maxBookingDuration: { gte: bookingDurationHours } }
            ]
          }
        ]
      },
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async findAll(): Promise<CommissionStrategyEntity[]> {
    const strategies = await this.prisma.commissionStrategy.findMany({
      orderBy: { priority: 'desc' },
    });

    return strategies.map(strategy => this.toDomainEntity(strategy));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.commissionStrategy.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaStrategy: any): CommissionStrategyEntity {
    return CommissionStrategyEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaStrategy.id),
      name: CommissionName.fromPersistence(prismaStrategy.name),
      type: CommissionType.fromPersistence(prismaStrategy.type),
      value: CommissionValue.fromPersistence(prismaStrategy.value),
      description: prismaStrategy.description,
      isActive: prismaStrategy.isActive,
      priority: prismaStrategy.priority,
      applicableResourceTypes: prismaStrategy.applicableResourceTypes || [],
      minBookingDuration: prismaStrategy.minBookingDuration,
      maxBookingDuration: prismaStrategy.maxBookingDuration,
      createdAt: prismaStrategy.createdAt,
      updatedAt: prismaStrategy.updatedAt,
    });
  }
}
