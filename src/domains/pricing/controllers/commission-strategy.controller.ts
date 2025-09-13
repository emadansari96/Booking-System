import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { CreateCommissionStrategyCommand } from '../commands/create-commission-strategy.command';
import { UpdateCommissionStrategyCommand } from '../commands/update-commission-strategy.command';
import { UpdateCommissionValueCommand } from '../commands/update-commission-value.command';
import { ActivateCommissionStrategyCommand } from '../commands/activate-commission-strategy.command';
import { DeactivateCommissionStrategyCommand } from '../commands/deactivate-commission-strategy.command';
import { DeleteCommissionStrategyCommand } from '../commands/delete-commission-strategy.command';
// Queries
import { GetCommissionStrategyByIdQuery } from '../queries/get-commission-strategy-by-id.query';
import { GetCommissionStrategiesQuery } from '../queries/get-commission-strategies.query';
@Controller('commission-strategies')
@UseGuards(JwtAuthGuard)
export class CommissionStrategyController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async createCommissionStrategy(@Body() createDto: any): Promise<any> {
    const command = new CreateCommissionStrategyCommand(
      createDto.name,
      createDto.type,
      createDto.value,
      createDto.description,
      createDto.priority,
      createDto.applicableResourceTypes,
      createDto.minBookingDuration,
      createDto.maxBookingDuration
    );
    const strategy = await this.commandBus.execute(command);
    return this.mapToResponseDto(strategy);
  }
@Get()
                async getCommissionStrategies(
    @Query('isActive') isActive?: boolean,
    @Query('type') type?: string,
    @Query('resourceType') resourceType?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new GetCommissionStrategiesQuery(
      isActive,
      type as 'PERCENTAGE' | 'FIXED_AMOUNT' | undefined,
      resourceType,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      strategies: result.strategies.map(strategy => this.mapToResponseDto(strategy)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }
@Get(':id')
        async getCommissionStrategyById(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const query = new GetCommissionStrategyByIdQuery(id);
    const strategy = await this.queryBus.execute(query);
    if (!strategy) {
      return null;
    }
    return this.mapToResponseDto(strategy);
  }
@Put(':id')
        async updateCommissionStrategy(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: any
  ): Promise<any> {
    // Update basic details
    const command = new UpdateCommissionStrategyCommand(
      id,
      updateDto.name,
      updateDto.description,
      updateDto.priority,
      updateDto.applicableResourceTypes,
      updateDto.minBookingDuration,
      updateDto.maxBookingDuration
    );
    await this.commandBus.execute(command);

    // Update value if provided
    if (updateDto.value !== undefined) {
      const valueCommand = new UpdateCommissionValueCommand(id, 'PERCENTAGE', updateDto.value);
      await this.commandBus.execute(valueCommand);
    }

    // Return updated strategy
    const query = new GetCommissionStrategyByIdQuery(id);
    const strategy = await this.queryBus.execute(query);
    return this.mapToResponseDto(strategy);
  }
@Put(':id/value')
        async updateCommissionValue(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: { type: 'PERCENTAGE' | 'FIXED_AMOUNT'; value: number }
  ): Promise<any> {
    const command = new UpdateCommissionValueCommand(id, updateDto.type, updateDto.value);
    const strategy = await this.commandBus.execute(command);
    return this.mapToResponseDto(strategy);
  }
@Put(':id/activate')
        async activateCommissionStrategy(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new ActivateCommissionStrategyCommand(id);
    const strategy = await this.commandBus.execute(command);
    return this.mapToResponseDto(strategy);
  }
@Put(':id/deactivate')
        async deactivateCommissionStrategy(@Param('id', ParseUUIDPipe) id: string): Promise<any> {
    const command = new DeactivateCommissionStrategyCommand(id);
    const strategy = await this.commandBus.execute(command);
    return this.mapToResponseDto(strategy);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
        async deleteCommissionStrategy(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const command = new DeleteCommissionStrategyCommand(id);
    await this.commandBus.execute(command);
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(strategy: any): any {
    if (!strategy) {
      return null;
    }
    
    return {
      id: strategy.id?.value || strategy.id,
      name: strategy.name?.value || strategy.name,
      type: strategy.type?.value || strategy.type,
      value: strategy.value?.value || strategy.value,
      description: strategy.description,
      isActive: strategy.isActive,
      priority: strategy.priority,
      applicableResourceTypes: strategy.applicableResourceTypes,
      minBookingDuration: strategy.minBookingDuration,
      maxBookingDuration: strategy.maxBookingDuration,
      createdAt: strategy.createdAt,
      updatedAt: strategy.updatedAt
    };
  }
}
