import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { CalculatePricingQuery } from '../queries/calculate-pricing.query';
import { GetPricingBreakdownQuery } from '../queries/get-pricing-breakdown.query';
import {
  CalculatePricingDto,
  GetPricingBreakdownDto,
  PricingCalculationResponseDto,
  PricingBreakdownResponseDto,
} from '../dtos/pricing.dto';

@Controller('pricing')
export class PricingController {
  constructor(
    private readonly queryBus: QueryBus,
  ) {}

  @Post('calculate')
  async calculatePricing(@Body() dto: CalculatePricingDto): Promise<PricingCalculationResponseDto> {
    const query = new CalculatePricingQuery(
      dto.resourceId,
      dto.resourceType,
      dto.basePrice,
      dto.currency,
      dto.bookingDurationHours,
      new Date(dto.startDate),
      new Date(dto.endDate)
    );

    return await this.queryBus.execute(query);
  }

  @Get('breakdown')
  async getPricingBreakdown(@Query() dto: GetPricingBreakdownDto): Promise<PricingBreakdownResponseDto> {
    const query = new GetPricingBreakdownQuery(
      dto.resourceId,
      dto.resourceType,
      dto.basePrice,
      dto.currency,
      dto.bookingDurationHours
    );

    return await this.queryBus.execute(query);
  }
}
