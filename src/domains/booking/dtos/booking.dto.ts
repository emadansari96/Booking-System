import { IsString, IsOptional, IsDateString, IsNumber, IsEnum, IsObject, Min, Max } from 'class-validator';
import { BookingStatus } from '../value-objects/booking-status.value-object';
export class CreateBookingDto {
  @IsString()
  userId: string;
@IsString()
  resourceId: string;
@IsString()
  resourceItemId: string;
@IsDateString()
  startDate: string;
@IsDateString()
  endDate: string;
@IsOptional()
  @IsString()
  notes?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ConfirmBookingDto {
  @IsString()
  bookingId: string;
@IsOptional()
  @IsString()
  notes?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CancelBookingDto {
  @IsString()
  bookingId: string;
@IsOptional()
  @IsString()
  reason?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class CompleteBookingDto {
  @IsString()
  bookingId: string;
@IsOptional()
  @IsString()
  notes?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ExpireBookingDto {
  @IsString()
  bookingId: string;
@IsOptional()
  @IsString()
  reason?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessBookingPaymentDto {
  @IsString()
  bookingId: string;
@IsString()
  paymentMethod: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class GetBookingsDto {
  @IsOptional()
  @IsString()
  userId?: string;
@IsOptional()
  @IsString()
  resourceId?: string;
@IsOptional()
  @IsString()
  resourceItemId?: string;
@IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
@IsOptional()
  @IsDateString()
  startDate?: string;
@IsOptional()
  @IsDateString()
  endDate?: string;
@IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;
@IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}

export class CheckBookingAvailabilityDto {
  @IsString()
  resourceItemId: string;
@IsDateString()
  startDate: string;
@IsDateString()
  endDate: string;
}

export class GetBookingStatisticsDto {
  @IsOptional()
  @IsString()
  userId?: string;
@IsOptional()
  @IsString()
  resourceId?: string;
@IsOptional()
  @IsDateString()
  startDate?: string;
@IsOptional()
  @IsDateString()
  endDate?: string;
}

export class BookingResponseDto {
  id: string;
  userId: string;
  resourceId: string;
  resourceItemId: string;
  status: BookingStatus;
  startDate: Date;
  endDate: Date;
  basePrice: number;
  commissionAmount: number;
  totalPrice: number;
  currency: string;
  notes?: string;
  paymentDeadline?: Date;
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  expiredAt?: Date;
  paymentFailedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class BookingAvailabilityResponseDto {
  isAvailable: boolean;
  conflictingBookings: BookingResponseDto[];
  availableSlots: Array<{
    startDate: Date;
    endDate: Date;
  }>;
}

export class BookingStatisticsResponseDto {
  totalBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  completedBookings: number;
  expiredBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  averageBookingDuration: number;
  bookingTrends: Array<{
    date: string;
    count: number;
    revenue: number;
  }>;
}
