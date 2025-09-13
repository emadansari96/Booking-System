import { HttpException, HttpStatus } from '@nestjs/common';
export class CommissionStrategyNotFoundException extends HttpException {
  constructor(strategyId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Commission strategy not found',
        error: 'COMMISSION_STRATEGY_NOT_FOUND',
        details: { strategyId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

export class InvalidCommissionRateException extends HttpException {
  constructor(rate: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid commission rate',
        error: 'INVALID_COMMISSION_RATE',
        details: { 
          rate,
          reason: 'Commission rate must be between 0 and 100'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class InvalidCommissionTypeException extends HttpException {
  constructor(type: string) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid commission type',
        error: 'INVALID_COMMISSION_TYPE',
        details: { 
          type,
          validTypes: ['PERCENTAGE', 'FIXED']
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CommissionStrategyConflictException extends HttpException {
  constructor(resourceType: string, priority: number) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'Commission strategy conflict',
        error: 'COMMISSION_STRATEGY_CONFLICT',
        details: { 
          resourceType,
          priority,
          reason: 'Multiple strategies with same priority for resource type'
        }
      },
      HttpStatus.CONFLICT
    );
  }
}

export class PricingCalculationFailedException extends HttpException {
  constructor(resourceItemId: string, reason: string) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Pricing calculation failed',
        error: 'PRICING_CALCULATION_FAILED',
        details: { resourceItemId, reason }
      },
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}

export class InvalidPricingPeriodException extends HttpException {
  constructor(startDate: Date, endDate: Date) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid pricing period',
        error: 'INVALID_PRICING_PERIOD',
        details: { 
          startDate,
          endDate,
          reason: 'End date must be after start date'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class CommissionStrategyInUseException extends HttpException {
  constructor(strategyId: string) {
    super(
      {
        statusCode: HttpStatus.CONFLICT,
        message: 'Commission strategy is currently in use',
        error: 'COMMISSION_STRATEGY_IN_USE',
        details: { 
          strategyId,
          reason: 'Cannot delete strategy that is being used by active bookings'
        }
      },
      HttpStatus.CONFLICT
    );
  }
}

export class InvalidDiscountException extends HttpException {
  constructor(discount: number) {
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid discount amount',
        error: 'INVALID_DISCOUNT',
        details: { 
          discount,
          reason: 'Discount must be between 0 and 100 percent'
        }
      },
      HttpStatus.BAD_REQUEST
    );
  }
}

export class PricingRuleNotFoundException extends HttpException {
  constructor(ruleId: string) {
    super(
      {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Pricing rule not found',
        error: 'PRICING_RULE_NOT_FOUND',
        details: { ruleId }
      },
      HttpStatus.NOT_FOUND
    );
  }
}

