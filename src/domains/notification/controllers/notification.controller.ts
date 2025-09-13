import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { CreateNotificationCommand } from '../commands/create-notification.command';
import { CreateBulkNotificationCommand } from '../commands/create-bulk-notification.command';
import { SendNotificationImmediatelyCommand } from '../commands/send-notification-immediately.command';
import { CancelNotificationCommand } from '../commands/cancel-notification.command';
import { RetryNotificationCommand } from '../commands/retry-notification.command';
// Queries
import { GetNotificationByIdQuery } from '../queries/get-notification-by-id.query';
import { GetNotificationsQuery } from '../queries/get-notifications.query';
import { GetNotificationStatisticsQuery } from '../queries/get-notification-statistics.query';
@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async createNotification(@Request() req: any, @Body() createNotificationDto: any): Promise<any> {
    const command = new CreateNotificationCommand(
      req.user.id,
      createNotificationDto.type,
      createNotificationDto.title,
      createNotificationDto.message,
      createNotificationDto.priority,
      createNotificationDto.email,
      createNotificationDto.phoneNumber,
      createNotificationDto.metadata,
      createNotificationDto.scheduledAt ? new Date(createNotificationDto.scheduledAt) : undefined,
      createNotificationDto.maxRetries
    );
    const notification = await this.commandBus.execute(command);
    return this.mapToResponseDto(notification);
  }
@Get()
                      async getNotifications(
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new GetNotificationsQuery(
      userId,
      type,
      status,
      priority,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      notifications: result.notifications.map(notification => this.mapToResponseDto(notification)),
      pagination: result.pagination
    };
  }
@Get(':id')
        async getNotificationById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const query = new GetNotificationByIdQuery(id);
    const notification = await this.queryBus.execute(query);
    if (!notification) {
      return null;
    }
    return this.mapToResponseDto(notification);
  }
@Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async createBulkNotifications(@Body() createBulkNotificationDto: any): Promise<any> {
    const command = new CreateBulkNotificationCommand(
      createBulkNotificationDto.userIds,
      createBulkNotificationDto.type,
      createBulkNotificationDto.title,
      createBulkNotificationDto.message,
      createBulkNotificationDto.priority,
      createBulkNotificationDto.metadata,
      createBulkNotificationDto.scheduledAt ? new Date(createBulkNotificationDto.scheduledAt) : undefined,
      createBulkNotificationDto.maxRetries
    );
    const result = await this.commandBus.execute(command);
    return {
      created: result.created,
      failed: result.failed,
      total: result.total
    };
  }
@Put(':id/send')
        async sendNotificationImmediately(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new SendNotificationImmediatelyCommand(id);
    return await this.commandBus.execute(command);
  }
@Put(':id/retry')
        async retryNotification(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new RetryNotificationCommand(id);
    return await this.commandBus.execute(command);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
        async cancelNotification(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const command = new CancelNotificationCommand(id);
    await this.commandBus.execute(command);
  }
@Get('statistics')
            async getNotificationStatistics(
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    const query = new GetNotificationStatisticsQuery(
      userId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
    return await this.queryBus.execute(query);
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(notification: any): any {
    return {
      id: notification.id.value,
      userId: notification.userId.value,
      type: notification.type.value,
      title: notification.title.value,
      message: notification.message.value,
      priority: notification.priority.value,
      status: notification.status.value,
      email: notification.email?.value,
      phoneNumber: notification.phoneNumber?.value,
      metadata: notification.metadata,
      scheduledAt: notification.scheduledAt,
      sentAt: notification.sentAt,
      readAt: notification.readAt,
      retryCount: notification.retryCount,
      maxRetries: notification.maxRetries,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt
    };
  }
}
