import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, IsArray, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaymentMethodDto {
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

export enum PaymentStatusDto {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class ProcessPaymentDto {
  @IsString()
  userId: string;

  @IsString()
  resourceId: string;

  @IsOptional()
  @IsString()
  resourceItemId?: string;

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

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class BulkPaymentItemDto {
  @IsString()
  resourceId: string;

  @IsOptional()
  @IsString()
  resourceItemId?: string;

  @IsString()
  resourceType: string;

  @IsNumber()
  @Min(0)
  basePrice: number;

  @IsNumber()
  @Min(0)
  bookingDurationHours: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ProcessBulkPaymentDto {
  @IsString()
  userId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPaymentItemDto)
  items: BulkPaymentItemDto[];

  @IsString()
  currency: string;

  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  taxRate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discountAmount?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class ApprovePaymentDto {
  @IsString()
  approvedBy: string;
}

export class FailPaymentDto {
  @IsString()
  reason: string;
}

export class PaymentResponseDto {
  id: string;
  userId: string;
  invoiceId: string;
  method: string;
  status: string;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
  metadata?: Record<string, any>;
  approvedBy?: string;
  approvedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentListResponseDto {
  payments: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export class PaymentSummaryResponseDto {
  totalPayments: number;
  totalAmount: number;
  completedPayments: number;
  pendingPayments: number;
  failedPayments: number;
  cancelledPayments: number;
  refundedPayments: number;
}
