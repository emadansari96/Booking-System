import { IsString, IsNumber, IsOptional, IsBoolean, IsArray, IsEnum, Min, Max } from 'class-validator';

export enum CommissionTypeDto {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export class CreateCommissionStrategyDto {
  @IsString()
  name: string;

  @IsEnum(CommissionTypeDto)
  type: CommissionTypeDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableResourceTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBookingDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBookingDuration?: number;
}

export class UpdateCommissionStrategyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  priority?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  applicableResourceTypes?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  minBookingDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxBookingDuration?: number;
}

export class UpdateCommissionValueDto {
  @IsEnum(CommissionTypeDto)
  type: CommissionTypeDto;

  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}

export class CommissionStrategyResponseDto {
  id: string;
  name: string;
  type: string;
  value: number;
  description?: string;
  isActive: boolean;
  priority: number;
  applicableResourceTypes: string[];
  minBookingDuration?: number;
  maxBookingDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CommissionStrategyListResponseDto {
  strategies: CommissionStrategyResponseDto[];
  total: number;
  page: number;
  limit: number;
}
