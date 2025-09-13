import { IsString, IsNumber, IsDateString, IsOptional, IsEnum, Min, IsArray, ValidateNested, IsObject } from 'class-validator';
export enum InvoiceStatusDto {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export class InvoiceItemDto {
  @IsString()
  id: string;
@IsString()
  resourceId: string;
@IsOptional()
  @IsString()
  resourceItemId?: string;
@IsString()
  description: string;
@IsNumber()
  @Min(0)
  quantity: number;
@IsNumber()
  @Min(0)
  unitPrice: number;
@IsNumber()
  @Min(0)
  totalPrice: number;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class InvoiceResponseDto {
  id: string;
  invoiceNumber: string;
  userId: string;
  status: string;
  items: InvoiceItemDto[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class InvoiceListResponseDto {
  invoices: InvoiceResponseDto[];
  total: number;
  page: number;
  limit: number;
}
