import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAvailableResourcesQuery } from '../get-available-resources.query';
import { ResourceEntity } from '../../entities/resource.entity';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';

export interface GetAvailableResourcesResult {
  resources: ResourceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@QueryHandler(GetAvailableResourcesQuery)
export class GetAvailableResourcesHandler implements IQueryHandler<GetAvailableResourcesQuery> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(query: GetAvailableResourcesQuery): Promise<GetAvailableResourcesResult> {
    const {
      type,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      amenities,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const result = await this.resourceRepository.findAvailable({
      type,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      amenities,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder,
    });

    return {
      resources: result.resources,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }
}
