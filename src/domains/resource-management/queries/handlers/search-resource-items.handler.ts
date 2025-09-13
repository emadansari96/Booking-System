import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { SearchResourceItemsQuery } from '../search-resource-items.query';
import { ResourceItemSearchResult } from '../../interfaces/resource-item-repository.interface';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';
@QueryHandler(SearchResourceItemsQuery)
export class SearchResourceItemsHandler implements IQueryHandler<SearchResourceItemsQuery> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(query: SearchResourceItemsQuery): Promise<any> {
    const criteria = {
      resourceId: query.resourceId,
      status: query.status,
      type: query.type,
      isActive: query.isActive,
      minCapacity: query.minCapacity,
      maxCapacity: query.maxCapacity,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      location: query.location,
      amenities: query.amenities,
    };

    const result = await this.resourceItemRepository.searchByCriteria(criteria, query.page, query.limit);
    
    return {
      items: result.items,
      total: result.total,
      page: result.page,
      limit: result.limit,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit
      }
    };
  }
}
