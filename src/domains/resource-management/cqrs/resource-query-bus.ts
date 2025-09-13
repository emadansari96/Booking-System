import { Injectable } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { GetResourceByIdQuery } from '../queries/get-resource-by-id.query';
import { SearchResourcesQuery } from '../queries/search-resources.query';
import { GetAvailableResourcesQuery } from '../queries/get-available-resources.query';
import { GetResourceAvailabilityQuery } from '../queries/get-resource-availability.query';
import { ResourceEntity } from '../entities/resource.entity';
export interface SearchResourcesResult {
  resources: ResourceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetAvailableResourcesResult {
  resources: ResourceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResourceAvailabilityResult {
  resourceId: string;
  isAvailable: boolean;
  conflictingBookings?: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
  }>;
  availableSlots?: Array<{
    startDate: Date;
    endDate: Date;
  }>;
}
@Injectable()
export class ResourceQueryBus {
  constructor(private readonly queryBus: QueryBus) {}

  async getResourceById(query: GetResourceByIdQuery): Promise<ResourceEntity | null> {
    return this.queryBus.execute(query);
  }

  async searchResources(query: SearchResourcesQuery): Promise<SearchResourcesResult> {
    return this.queryBus.execute(query);
  }

  async getAvailableResources(query: GetAvailableResourcesQuery): Promise<GetAvailableResourcesResult> {
    return this.queryBus.execute(query);
  }

  async getResourceAvailability(query: GetResourceAvailabilityQuery): Promise<ResourceAvailabilityResult> {
    return this.queryBus.execute(query);
  }
}
