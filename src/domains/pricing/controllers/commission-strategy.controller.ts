import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateCommissionStrategyCommand } from '../commands/create-commission-strategy.command';
import { UpdateCommissionStrategyCommand } from '../commands/update-commission-strategy.command';
import { UpdateCommissionValueCommand } from '../commands/update-commission-value.command';
import { ActivateCommissionStrategyCommand } from '../commands/activate-commission-strategy.command';
import { DeactivateCommissionStrategyCommand } from '../commands/deactivate-commission-strategy.command';
import { DeleteCommissionStrategyCommand } from '../commands/delete-commission-strategy.command';
import { GetCommissionStrategyByIdQuery } from '../queries/get-commission-strategy-by-id.query';
import { GetCommissionStrategiesQuery } from '../queries/get-commission-strategies.query';
import {
  CreateCommissionStrategyDto,
  UpdateCommissionStrategyDto,
  UpdateCommissionValueDto,
  CommissionStrategyResponseDto,
  CommissionStrategyListResponseDto,
} from '../dtos/commission-strategy.dto';

@Controller('commission-strategies')
export class CommissionStrategyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createCommissionStrategy(@Body() dto: CreateCommissionStrategyDto): Promise<CommissionStrategyResponseDto> {
    const command = new CreateCommissionStrategyCommand(
      dto.name,
      dto.type,
      dto.value,
      dto.description,
      dto.priority,
      dto.applicableResourceTypes,
      dto.minBookingDuration,
      dto.maxBookingDuration
    );

    const result = await this.commandBus.execute(command);

    return {
      id: result.id.value,
      name: result.name.value,
      type: result.type.value,
      value: result.value.value,
      description: result.description,
      isActive: result.isActive,
      priority: result.priority,
      applicableResourceTypes: result.applicableResourceTypes,
      minBookingDuration: result.minBookingDuration,
      maxBookingDuration: result.maxBookingDuration,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    };
  }

  @Get(':id')
  async getCommissionStrategyById(@Param('id') id: string): Promise<CommissionStrategyResponseDto> {
    const query = new GetCommissionStrategyByIdQuery(id);
    return await this.queryBus.execute(query);
  }

  @Get()
  async getCommissionStrategies(
    @Query('isActive') isActive?: boolean,
    @Query('type') type?: string,
    @Query('resourceType') resourceType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ): Promise<CommissionStrategyListResponseDto> {
    const query = new GetCommissionStrategiesQuery(
      isActive,
      type as any,
      resourceType,
      page,
      limit
    );
    return await this.queryBus.execute(query);
  }

  @Put(':id')
  async updateCommissionStrategy(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionStrategyDto
  ): Promise<void> {
    const command = new UpdateCommissionStrategyCommand(
      id,
      dto.name,
      dto.description,
      dto.priority,
      dto.applicableResourceTypes,
      dto.minBookingDuration,
      dto.maxBookingDuration
    );

    await this.commandBus.execute(command);
  }

  @Put(':id/commission-value')
  async updateCommissionValue(
    @Param('id') id: string,
    @Body() dto: UpdateCommissionValueDto
  ): Promise<void> {
    const command = new UpdateCommissionValueCommand(
      id,
      dto.type,
      dto.value
    );

    await this.commandBus.execute(command);
  }

  @Put(':id/activate')
  async activateCommissionStrategy(@Param('id') id: string): Promise<void> {
    const command = new ActivateCommissionStrategyCommand(id);
    await this.commandBus.execute(command);
  }

  @Put(':id/deactivate')
  async deactivateCommissionStrategy(@Param('id') id: string): Promise<void> {
    const command = new DeactivateCommissionStrategyCommand(id);
    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCommissionStrategy(@Param('id') id: string): Promise<void> {
    const command = new DeleteCommissionStrategyCommand(id);
    await this.commandBus.execute(command);
  }
}
