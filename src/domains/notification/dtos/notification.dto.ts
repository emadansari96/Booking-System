import { IsString, IsOptional, IsEnum, IsDateString, IsNumber, IsObject, IsArray, IsUUID } from 'class-validator';
export class CreateNotificationDto {
  @IsUUID()
  userId: string;
@IsEnum(['PAYMENT_CONFIRMATION', 'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'PAYMENT_FAILED', 'RESOURCE_AVAILABLE', 'REMINDER', 'SYSTEM_UPDATE', 'PROMOTION', 'SECURITY_ALERT', 'GENERAL'])
  type: string;
@IsString()
  title: string;
@IsString()
  message: string;
@IsOptional()
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: string;
@IsOptional()
  @IsString()
  email?: string;
@IsOptional()
  @IsString()
  phoneNumber?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
@IsOptional()
  @IsDateString()
  scheduledAt?: string;
@IsOptional()
  @IsNumber()
  maxRetries?: number;
}

export class CreateBulkNotificationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
@IsEnum(['PAYMENT_CONFIRMATION', 'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'PAYMENT_FAILED', 'RESOURCE_AVAILABLE', 'REMINDER', 'SYSTEM_UPDATE', 'PROMOTION', 'SECURITY_ALERT', 'GENERAL'])
  type: string;
@IsString()
  title: string;
@IsString()
  message: string;
@IsOptional()
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: string;
@IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
@IsOptional()
  @IsDateString()
  scheduledAt?: string;
@IsOptional()
  @IsNumber()
  maxRetries?: number;
}

export class NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  status: string;
  priority: string;
  title: string;
  message: string;
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  failedAt?: Date;
  cancelledAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

export class NotificationStatisticsDto {
  totalNotifications: number;
  pendingNotifications: number;
  sentNotifications: number;
  deliveredNotifications: number;
  failedNotifications: number;
  cancelledNotifications: number;
  successRate: number;
}

export class GetNotificationsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;
@IsOptional()
  @IsEnum(['PAYMENT_CONFIRMATION', 'BOOKING_CREATED', 'BOOKING_CONFIRMATION', 'BOOKING_CANCELLATION', 'BOOKING_EXPIRED', 'PAYMENT_FAILED', 'RESOURCE_AVAILABLE', 'REMINDER', 'SYSTEM_UPDATE', 'PROMOTION', 'SECURITY_ALERT', 'GENERAL'])
  type?: string;
@IsOptional()
  @IsEnum(['PENDING', 'SENT', 'DELIVERED', 'FAILED', 'CANCELLED'])
  status?: string;
@IsOptional()
  @IsEnum(['LOW', 'NORMAL', 'HIGH', 'URGENT'])
  priority?: string;
@IsOptional()
  @IsDateString()
  startDate?: string;
@IsOptional()
  @IsDateString()
  endDate?: string;
@IsOptional()
  @IsNumber()
  page?: number;
@IsOptional()
  @IsNumber()
  limit?: number;
@IsOptional()
  @IsEnum(['createdAt', 'scheduledAt', 'priority', 'status'])
  sortBy?: string;
@IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: string;
}
