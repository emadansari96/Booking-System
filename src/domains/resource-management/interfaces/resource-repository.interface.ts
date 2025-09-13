
import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { ResourceEntity } from '../entities/resource.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface ResourceSearchCriteria {
  name?: string;
  type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';
  isActive?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  amenities?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'capacity' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ResourceAvailabilityCriteria {
  type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';
  minCapacity?: number;
  maxCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  amenities?: string[];
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'price' | 'capacity' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface ResourceSearchResult {
  resources: ResourceEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface ResourceAvailabilityResult {
  availableResources: ResourceEntity[];
  totalAvailable: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ResourceRepositoryInterface extends RepositoryInterface<ResourceEntity> {
  findById(id: UuidValueObject): Promise<ResourceEntity | null>;
  findByName(name: string): Promise<ResourceEntity | null>;
  search(criteria: ResourceSearchCriteria): Promise<ResourceSearchResult>;
  findAvailable(criteria: ResourceAvailabilityCriteria): Promise<ResourceSearchResult>;
  checkAvailability(
    resourceId: UuidValueObject,
    startDate: Date,
    endDate: Date
  ): Promise<ResourceAvailabilityResult>;
  findByType(type: string): Promise<ResourceEntity[]>;
  findByStatus(status: string): Promise<ResourceEntity[]>;
  findByLocation(location: string): Promise<ResourceEntity[]>;
  findByAmenities(amenities: string[]): Promise<ResourceEntity[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<ResourceEntity[]>;
  findByCapacityRange(minCapacity: number, maxCapacity: number): Promise<ResourceEntity[]>;
}
