import { Controller, Post, Get, Query, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LogActivityDto } from '../dto/log-activity.dto';
import { SearchAuditLogsDto } from '../dto/search-audit-logs.dto';
import { AuditLogStatisticsDto } from '../dto/audit-log-statistics.dto';
import { LogActivityCommand } from '../commands/log-activity.command';
import { GetAuditLogsQuery } from '../queries/get-audit-logs.query';
import { GetAuditLogByIdQuery } from '../queries/get-audit-log-by-id.query';
import { GetAuditLogStatisticsQuery } from '../queries/get-audit-log-statistics.query';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

@Controller('audit-logs')
export class AuditLogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async logActivity(@Body() dto: LogActivityDto) {
    const command = new LogActivityCommand(
      dto.userId ? UuidValueObject.fromString(dto.userId) : undefined,
      dto.sessionId,
      dto.action,
      dto.domain,
      dto.entityType,
      dto.entityId,
      dto.status,
      dto.severity,
      dto.description,
      dto.oldValues,
      dto.newValues,
      dto.metadata,
      dto.ipAddress,
      dto.userAgent,
    );

    await this.commandBus.execute(command);
    return { success: true, message: 'Activity logged successfully' };
  }

  @Get()
  async getAuditLogs(@Query() dto: SearchAuditLogsDto) {
    const query = new GetAuditLogsQuery(
      dto.userId,
      dto.sessionId,
      dto.action,
      dto.domain,
      dto.entityType,
      dto.entityId,
      dto.status,
      dto.severity,
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
      dto.ipAddress,
      dto.page,
      dto.limit,
      dto.sortBy,
      dto.sortOrder,
    );

    return await this.queryBus.execute(query);
  }

  @Get(':id')
  async getAuditLogById(@Param('id') id: string) {
    const query = new GetAuditLogByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get('statistics/overview')
  async getAuditLogStatistics(@Query() dto: AuditLogStatisticsDto) {
    const query = new GetAuditLogStatisticsQuery(
      dto.startDate ? new Date(dto.startDate) : undefined,
      dto.endDate ? new Date(dto.endDate) : undefined,
    );

    return await this.queryBus.execute(query);
  }
}
