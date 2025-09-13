import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAvailableResourceItemsQuery } from '../get-available-resource-items.query';
import { ResourceItemAvailabilityResult } from '../../interfaces/resource-item-repository.interface';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';
@QueryHandler(GetAvailableResourceItemsQuery)
export class GetAvailableResourceItemsHandler implements IQueryHandler<GetAvailableResourceItemsQuery> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(query: GetAvailableResourceItemsQuery): Promise<ResourceItemAvailabilityResult> {
    const criteria = {
      resourceId: query.resourceId,
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status,
      type: query.type,
      minCapacity: query.minCapacity,
      maxCapacity: query.maxCapacity,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
    };

    return this.resourceItemRepository.findAvailableByPeriod(criteria);
  }
}
