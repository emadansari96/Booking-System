import { Injectable } from '@nestjs/common';
import { CommissionStrategyEntity } from '../entities/commission-strategy.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { CommissionStrategyNotFoundException, InvalidCommissionRateException, InvalidCommissionTypeException, CommissionStrategyConflictException, PricingCalculationFailedException, InvalidPricingPeriodException, CommissionStrategyInUseException, InvalidDiscountException, PricingRuleNotFoundException } from '../../../shared/exceptions/pricing.exceptions';
export interface PricingCalculationInput {
  resourceId: UuidValueObject;
  resourceType: string;
  basePrice: number;
  currency: string;
  bookingDurationHours: number;
  startDate: Date;
  endDate: Date;
}

export interface PricingCalculationResult {
  resourceId: string;
  basePrice: number;
  currency: string;
  bookingDurationHours: number;
  subtotal: number;
  commission: number;
  totalPrice: number;
  appliedCommissionStrategy?: {
    id: string;
    name: string;
    type: string;
    value: number;
  };
  breakdown: {
    baseAmount: number;
    commissionAmount: number;
    totalAmount: number;
  };
}
@Injectable()
export class PricingService {
  /**
   * Calculate the total price including commission for a booking
   */
  public calculatePricing(
    input: PricingCalculationInput,
    commissionStrategies: CommissionStrategyEntity[]
  ): PricingCalculationResult {
    const { basePrice, bookingDurationHours, resourceType } = input;

    // Calculate subtotal (base price * duration)
    const subtotal = basePrice * bookingDurationHours;

    // Find applicable commission strategy
    const applicableStrategy = this.findApplicableCommissionStrategy(
      commissionStrategies,
      resourceType,
      bookingDurationHours
    );

    // Calculate commission
    const commission = applicableStrategy 
      ? applicableStrategy.calculateCommission(subtotal, bookingDurationHours, resourceType)
      : 0;

    // Calculate total price
    const totalPrice = subtotal + commission;

    return {
      resourceId: input.resourceId.value,
      basePrice: input.basePrice,
      currency: input.currency,
      bookingDurationHours: input.bookingDurationHours,
      subtotal,
      commission,
      totalPrice,
      appliedCommissionStrategy: applicableStrategy ? {
        id: applicableStrategy.id.value,
        name: applicableStrategy.name.value,
        type: applicableStrategy.type.value,
        value: applicableStrategy.value.value,
      } : undefined,
      breakdown: {
        baseAmount: subtotal,
        commissionAmount: commission,
        totalAmount: totalPrice,
      },
    };
  }

  /**
   * Calculate pricing for multiple resources (bulk calculation)
   */
  public calculateBulkPricing(
    inputs: PricingCalculationInput[],
    commissionStrategies: CommissionStrategyEntity[]
  ): PricingCalculationResult[] {
    return inputs.map(input => this.calculatePricing(input, commissionStrategies));
  }

  /**
   * Find the most applicable commission strategy based on priority and constraints
   */
  private findApplicableCommissionStrategy(
    strategies: CommissionStrategyEntity[],
    resourceType: string,
    bookingDurationHours: number
  ): CommissionStrategyEntity | undefined {
    // Filter active strategies that are applicable
    const applicableStrategies = strategies
      .filter(strategy => strategy.isActive)
      .filter(strategy => strategy.isApplicable(resourceType, bookingDurationHours))
      .sort((a, b) => b.priority - a.priority); // Sort by priority (highest first)

    return applicableStrategies[0]; // Return the highest priority strategy
  }

  /**
   * Calculate commission only (without base price)
   */
  public calculateCommissionOnly(
    baseAmount: number,
    resourceType: string,
    bookingDurationHours: number,
    commissionStrategies: CommissionStrategyEntity[]
  ): number {
    const applicableStrategy = this.findApplicableCommissionStrategy(
      commissionStrategies,
      resourceType,
      bookingDurationHours
    );

    return applicableStrategy 
      ? applicableStrategy.calculateCommission(baseAmount, bookingDurationHours, resourceType)
      : 0;
  }

  /**
   * Get pricing breakdown for a specific resource and duration
   */
  public getPricingBreakdown(
    resourceId: UuidValueObject,
    resourceType: string,
    basePrice: number,
    currency: string,
    bookingDurationHours: number,
    commissionStrategies: CommissionStrategyEntity[]
  ): {
    baseAmount: number;
    commissionAmount: number;
    totalAmount: number;
    commissionRate: number;
    appliedStrategy?: {
      id: string;
      name: string;
      type: string;
      value: number;
    };
  } {
    const baseAmount = basePrice * bookingDurationHours;
    const applicableStrategy = this.findApplicableCommissionStrategy(
      commissionStrategies,
      resourceType,
      bookingDurationHours
    );

    const commissionAmount = applicableStrategy 
      ? applicableStrategy.calculateCommission(baseAmount, bookingDurationHours, resourceType)
      : 0;

    const commissionRate = applicableStrategy 
      ? (applicableStrategy.type.isPercentage() ? applicableStrategy.value.value : 0)
      : 0;

    return {
      baseAmount,
      commissionAmount,
      totalAmount: baseAmount + commissionAmount,
      commissionRate,
      appliedStrategy: applicableStrategy ? {
        id: applicableStrategy.id.value,
        name: applicableStrategy.name.value,
        type: applicableStrategy.type.value,
        value: applicableStrategy.value.value,
      } : undefined,
    };
  }
}
