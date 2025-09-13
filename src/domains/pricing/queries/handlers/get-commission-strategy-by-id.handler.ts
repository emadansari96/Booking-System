import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetCommissionStrategyByIdQuery } from '../get-commission-strategy-by-id.query';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@QueryHandler(GetCommissionStrategyByIdQuery)
export class GetCommissionStrategyByIdHandler implements IQueryHandler<GetCommissionStrategyByIdQuery> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
  ) {}

  async execute(query: GetCommissionStrategyByIdQuery): Promise<any> {
    const id = UuidValueObject.fromString(query.id);
    
    const commissionStrategy = await this.commissionStrategyRepository.findById(id);
    
    if (!commissionStrategy) {
      return null;
    }

    return {
      id: commissionStrategy.id.value,
      name: commissionStrategy.name.value,
      type: commissionStrategy.type.value,
      value: commissionStrategy.value.value,
      description: commissionStrategy.description,
      isActive: commissionStrategy.isActive,
      priority: commissionStrategy.priority,
      applicableResourceTypes: commissionStrategy.applicableResourceTypes,
      minBookingDuration: commissionStrategy.minBookingDuration,
      maxBookingDuration: commissionStrategy.maxBookingDuration,
      createdAt: commissionStrategy.createdAt,
      updatedAt: commissionStrategy.updatedAt,
    };
  }
}
