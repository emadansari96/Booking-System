import { Controller, Post, Get, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateBulkNotificationCommand } from '../commands/create-bulk-notification.command';
import { SendNotificationImmediatelyCommand } from '../commands/send-notification-immediately.command';
import { CancelNotificationCommand } from '../commands/cancel-notification.command';
import { RetryNotificationCommand } from '../commands/retry-notification.command';
import { GetNotificationByIdQuery } from '../queries/get-notification-by-id.query';
import { GetNotificationsQuery } from '../queries/get-notifications.query';
import { GetNotificationStatisticsQuery } from '../queries/get-notification-statistics.query';
import { CreateNotificationDto, CreateBulkNotificationDto, NotificationResponseDto, NotificationStatisticsDto, GetNotificationsDto } from '../dtos/notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createNotification(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    const command = new CreateNotificationCommand(
      dto.userId,
      dto.type,
      dto.title,
      dto.message,
      dto.priority,
      dto.email,
      dto.phoneNumber,
      dto.metadata,
      dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      dto.maxRetries
    );

    const result = await this.commandBus.execute(command);
    return this.mapToResponseDto(result.notification);
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async createBulkNotifications(@Body() dto: CreateBulkNotificationDto): Promise<{
    success: boolean;
    message: string;
    notifications: NotificationResponseDto[];
    successCount: number;
    failureCount: number;
  }> {
    const command = new CreateBulkNotificationCommand(
      dto.userIds,
      dto.type,
      dto.title,
      dto.message,
      dto.priority,
      dto.metadata,
      dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      dto.maxRetries
    );

    const result = await this.commandBus.execute(command);
    return {
      success: result.success,
      message: result.message,
      notifications: result.notifications.map(n => this.mapToResponseDto(n)),
      successCount: result.successCount,
      failureCount: result.failureCount,
    };
  }

  @Put(':id/send')
  @HttpCode(HttpStatus.OK)
  async sendNotificationImmediately(@Param('id') id: string): Promise<NotificationResponseDto> {
    const command = new SendNotificationImmediatelyCommand(id);
    const result = await this.commandBus.execute(command);
    return this.mapToResponseDto(result.notification);
  }

  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelNotification(@Param('id') id: string): Promise<NotificationResponseDto> {
    const command = new CancelNotificationCommand(id);
    const result = await this.commandBus.execute(command);
    return this.mapToResponseDto(result.notification);
  }

  @Put(':id/retry')
  @HttpCode(HttpStatus.OK)
  async retryNotification(@Param('id') id: string): Promise<NotificationResponseDto> {
    const command = new RetryNotificationCommand(id);
    const result = await this.commandBus.execute(command);
    return this.mapToResponseDto(result.notification);
  }

  @Get(':id')
  async getNotificationById(@Param('id') id: string): Promise<NotificationResponseDto> {
    const query = new GetNotificationByIdQuery(id);
    const notification = await this.queryBus.execute(query);
    return this.mapToResponseDto(notification);
  }

  @Get()
  async getNotifications(@Query() dto: GetNotificationsDto): Promise<{
    notifications: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const query = new GetNotificationsQuery(
      dto.userId,
      dto.type,
      dto.status,
      dto.priority,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.page,
      dto.limit,
      dto.sortBy as any,
      dto.sortOrder as any
    );

    const result = await this.queryBus.execute(query);
    return {
      notifications: result.notifications.map(n => this.mapToResponseDto(n)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Get('statistics/summary')
  async getNotificationStatistics(@Query() dto: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    type?: string;
  }): Promise<NotificationStatisticsDto> {
    const query = new GetNotificationStatisticsQuery(
      dto.userId,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.type
    );

    return await this.queryBus.execute(query);
  }

  private mapToResponseDto(notification: any): NotificationResponseDto {
    return {
      id: notification.id.value,
      userId: notification.userId.value,
      type: notification.type.value,
      status: notification.status.value,
      priority: notification.priority.value,
      title: notification.title,
      message: notification.message,
      email: notification.email,
      phoneNumber: notification.phoneNumber,
      metadata: notification.metadata,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      failedAt: notification.failedAt,
      cancelledAt: notification.cancelledAt,
      failureReason: notification.failureReason,
      retryCount: notification.retryCount,
      maxRetries: notification.maxRetries,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}
