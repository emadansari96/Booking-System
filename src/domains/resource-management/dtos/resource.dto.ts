import { IsString, IsNumber, IsOptional, IsArray, IsEnum, IsDateString, Min, Max, Length } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateResourceDto {
    @IsString()
  @Length(1, 100)
  name: string;
@IsString()
  @Length(1, 500)
  description: string;
@IsNumber()
  @Min(1)
  @Max(1000)
  capacity: number;
@IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;
@IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string = 'USD';
@IsOptional()
  @IsEnum(['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'])
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE' = 'AVAILABLE';
@IsEnum(['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE'])
  type: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
@IsOptional()
  @IsString()
  @Length(1, 200)
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

export class UpdateResourceDto {
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;
@IsOptional()
  @IsString()
  @Length(1, 500)
  description?: string;
@IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  capacity?: number;
@IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price?: number;
@IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
@IsOptional()
  @IsEnum(['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'])
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';
@IsOptional()
  @IsEnum(['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE'])
  type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
@IsOptional()
  @IsString()
  @Length(1, 200)
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

export class ChangeResourceStatusDto {
  @IsEnum(['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'])
  status: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';
}

export class SearchResourcesDto {
  @IsOptional()
  @IsString()
  name?: string;
@IsOptional()
  @IsEnum(['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE'])
  type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
@IsOptional()
  @IsEnum(['AVAILABLE', 'BOOKED', 'MAINTENANCE', 'UNAVAILABLE'])
  status?: 'AVAILABLE' | 'BOOKED' | 'MAINTENANCE' | 'UNAVAILABLE';
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
@IsOptional()
  @IsEnum(['name', 'price', 'capacity', 'createdAt'])
  sortBy?: 'name' | 'price' | 'capacity' | 'createdAt' = 'createdAt';
@IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class GetAvailableResourcesDto {
  @IsOptional()
  @IsEnum(['ROOM', 'HALL', 'EQUIPMENT', 'SERVICE', 'VENUE'])
  type?: 'ROOM' | 'HALL' | 'EQUIPMENT' | 'SERVICE' | 'VENUE';
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
  @IsDateString()
  startDate?: string;
@IsOptional()
  @IsDateString()
  endDate?: string;
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
@IsOptional()
  @IsEnum(['name', 'price', 'capacity', 'createdAt'])
  sortBy?: 'name' | 'price' | 'capacity' | 'createdAt' = 'createdAt';
@IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class GetResourceAvailabilityDto {
  @IsDateString()
  startDate: string;
@IsDateString()
  endDate: string;
}
