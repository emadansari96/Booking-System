import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsBoolean, IsDateString, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
export enum ResourceItemStatusEnum {
  AVAILABLE = 'AVAILABLE',
  BOOKED = 'BOOKED',
  MAINTENANCE = 'MAINTENANCE',
  UNAVAILABLE = 'UNAVAILABLE',
  OUT_OF_ORDER = 'OUT_OF_ORDER'
}

export enum ResourceItemTypeEnum {
  ROOM = 'ROOM',
  HALL = 'HALL',
  EQUIPMENT = 'EQUIPMENT',
  SERVICE = 'SERVICE',
  VENUE = 'VENUE',
  TABLE = 'TABLE',
  SEAT = 'SEAT',
  PARKING_SPOT = 'PARKING_SPOT',
  LOCKER = 'LOCKER'
}

export class CreateResourceItemDto {
    @IsString()
  @Length(1, 100)
  name: string;
@IsEnum(ResourceItemTypeEnum)
  type: ResourceItemTypeEnum;
@IsNumber()
  @Min(1)
  @Max(10000)
  capacity: number;
@IsNumber()
  @Min(0)
  price: number;
@IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'USD';
@IsOptional()
  @IsEnum(ResourceItemStatusEnum)
  status?: ResourceItemStatusEnum = ResourceItemStatusEnum.AVAILABLE;
@IsOptional()
  @IsString()
  description?: string;
@IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string;
@IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
@IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class UpdateResourceItemDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;
@IsOptional()
  @IsString()
  description?: string;
@IsOptional()
  @IsString()
  @Length(1, 255)
  location?: string;
@IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
@IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}

export class ChangeResourceItemStatusDto {
  @IsEnum(ResourceItemStatusEnum)
  status: ResourceItemStatusEnum;
}

export class ResourceItemResponseDto {
  id: string;
  resourceId: string;
  name: string;
  status: ResourceItemStatusEnum;
  type: ResourceItemTypeEnum;
  capacity: number;
  price: number;
  currency: string;
  description?: string;
  location?: string;
  amenities?: string[];
  images?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SearchResourceItemsDto {
  @IsOptional()
  @IsString()
  resourceId?: string;
@IsOptional()
  @IsEnum(ResourceItemStatusEnum)
  status?: ResourceItemStatusEnum;
@IsOptional()
  @IsEnum(ResourceItemTypeEnum)
  type?: ResourceItemTypeEnum;
@IsOptional()
  @IsBoolean()
  isActive?: boolean;
@IsOptional()
  @IsNumber()
  @Min(1)
  minCapacity?: number;
@IsOptional()
  @IsNumber()
  @Min(1)
  maxCapacity?: number;
@IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;
@IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
@IsOptional()
  @IsString()
  location?: string;
@IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];
@IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;
@IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 10;
}

export class GetAvailableResourceItemsDto {
  @IsDateString()
  startDate: string;
@IsDateString()
  endDate: string;
@IsOptional()
  @IsEnum(ResourceItemStatusEnum)
  status?: ResourceItemStatusEnum;
@IsOptional()
  @IsEnum(ResourceItemTypeEnum)
  type?: ResourceItemTypeEnum;
@IsOptional()
  @IsNumber()
  @Min(1)
  minCapacity?: number;
@IsOptional()
  @IsNumber()
  @Min(1)
  maxCapacity?: number;
@IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;
@IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}

export class ResourceItemSearchResultDto {
  items: ResourceItemResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class ResourceItemAvailabilityResultDto {
  availableItems: ResourceItemResponseDto[];
  totalAvailable: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
