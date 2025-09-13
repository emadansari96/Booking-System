import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { SearchResourcesQuery } from '../search-resources.query';
import { ResourceEntity } from '../../entities/resource.entity';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
export interface SearchResourcesResult {
  resources: ResourceEntity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
@QueryHandler(SearchResourcesQuery)
export class SearchResourcesHandler implements IQueryHandler<SearchResourcesQuery> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(query: SearchResourcesQuery): Promise<SearchResourcesResult> {
    const {
      name,
      type,
      status,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      amenities,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const result = await this.resourceRepository.search({
      name,
      type,
      status,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      amenities,
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
