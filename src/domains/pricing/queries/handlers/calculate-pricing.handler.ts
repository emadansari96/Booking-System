import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CalculatePricingQuery } from '../calculate-pricing.query';
import { PricingService, PricingCalculationInput } from '../../services/pricing.service';
import { CommissionStrategyRepositoryInterface } from '../../interfaces/commission-strategy-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(CalculatePricingQuery)
export class CalculatePricingHandler implements IQueryHandler<CalculatePricingQuery> {
  constructor(
    @Inject('CommissionStrategyRepositoryInterface')
    private readonly commissionStrategyRepository: CommissionStrategyRepositoryInterface,
    private readonly pricingService: PricingService,
  ) {}

  async execute(query: CalculatePricingQuery): Promise<any> {
    // Get all active commission strategies
    const commissionStrategies = await this.commissionStrategyRepository.findActiveStrategies();

    // Prepare pricing calculation input
    const input: PricingCalculationInput = {
      resourceId: UuidValueObject.fromString(query.resourceId),
      resourceType: query.resourceType,
      basePrice: query.basePrice,
      currency: query.currency,
      bookingDurationHours: query.bookingDurationHours,
      startDate: query.startDate,
      endDate: query.endDate,
    };

    // Calculate pricing
    const result = this.pricingService.calculatePricing(input, commissionStrategies);

    return result;
  }
}
