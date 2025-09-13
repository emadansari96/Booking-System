import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetPricingBreakdownQuery } from '../get-pricing-breakdown.query';
import { PricingService } from '../../services/pricing.service';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetPricingBreakdownQuery)
export class GetPricingBreakdownHandler implements IQueryHandler<GetPricingBreakdownQuery> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
    private readonly pricingService: PricingService,
  ) {}

  async execute(query: GetPricingBreakdownQuery): Promise<any> {
    // Get all active commission strategies
    const commissionStrategies = await this.commissionStrategyRepository.findActiveStrategies();

    // Get pricing breakdown
    const breakdown = this.pricingService.getPricingBreakdown(
      UuidValueObject.fromString(query.resourceId),
      query.resourceType,
      query.basePrice,
      query.currency,
      query.bookingDurationHours,
      commissionStrategies
    );

    return breakdown;
  }
}
