import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';
export class CalculatePricingDto {
  @IsString()
  resourceId: string;
@IsString()
  resourceType: string;
@IsNumber()
  @Min(0)
  basePrice: number;
@IsString()
  currency: string;
@IsNumber()
  @Min(0)
  bookingDurationHours: number;
@IsDateString()
  startDate: string;
@IsDateString()
  endDate: string;
}

export class GetPricingBreakdownDto {
  @IsString()
  resourceId: string;
@IsString()
  resourceType: string;
@IsNumber()
  @Min(0)
  basePrice: number;
@IsString()
  currency: string;
@IsNumber()
  @Min(0)
  bookingDurationHours: number;
}

export class PricingCalculationResponseDto {
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

export class PricingBreakdownResponseDto {
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
}
