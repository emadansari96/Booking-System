import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommissionStrategiesQuery } from '../get-commission-strategies.query';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
@QueryHandler(GetCommissionStrategiesQuery)
export class GetCommissionStrategiesHandler implements IQueryHandler<GetCommissionStrategiesQuery> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(query: GetCommissionStrategiesQuery): Promise<any> {
    const criteria = {
      isActive: query.isActive,
      type: query.type,
      applicableResourceTypes: query.resourceType ? [query.resourceType] : undefined,
      page: query.page,
      limit: query.limit,
    };

    const result = await this.commissionStrategyRepository.search(criteria);

    return {
      strategies: result.strategies.map(strategy => ({
        id: strategy.id.value,
        name: strategy.name.value,
        type: strategy.type.value,
        value: strategy.value.value,
        description: strategy.description,
        isActive: strategy.isActive,
        priority: strategy.priority,
        applicableResourceTypes: strategy.applicableResourceTypes,
        minBookingDuration: strategy.minBookingDuration,
        maxBookingDuration: strategy.maxBookingDuration,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
}
