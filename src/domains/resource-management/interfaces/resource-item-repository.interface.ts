import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { ResourceItemEntity } from '../entities/resource-item.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface ResourceItemSearchCriteria {
  resourceId?: string;
  status?: string;
  type?: string;
  isActive?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  amenities?: string[];
}

export interface ResourceItemAvailabilityCriteria {
  resourceId: string;
  startDate: Date;
  endDate: Date;
  status?: string;
  type?: string;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
}

export interface ResourceItemSearchResult {
  items: ResourceItemEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface ResourceItemAvailabilityResult {
  availableItems: ResourceItemEntity[];
  totalAvailable: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ResourceItemRepositoryInterface extends RepositoryInterface<ResourceItemEntity> {
  findById(id: UuidValueObject): Promise<ResourceItemEntity | null>;
  findByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]>;
  findByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<ResourceItemEntity[]>;
  findByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<ResourceItemEntity[]>;
  findAvailableByResourceId(resourceId: UuidValueObject): Promise<ResourceItemEntity[]>;
  searchByCriteria(criteria: ResourceItemSearchCriteria, page?: number, limit?: number): Promise<ResourceItemSearchResult>;
  findAvailableByPeriod(criteria: ResourceItemAvailabilityCriteria): Promise<ResourceItemAvailabilityResult>;
  findByStatus(status: string): Promise<ResourceItemEntity[]>;
  findByType(type: string): Promise<ResourceItemEntity[]>;
  findActiveItems(): Promise<ResourceItemEntity[]>;
  countByResourceId(resourceId: UuidValueObject): Promise<number>;
  countByResourceIdAndStatus(resourceId: UuidValueObject, status: string): Promise<number>;
  countByResourceIdAndType(resourceId: UuidValueObject, type: string): Promise<number>;
}
