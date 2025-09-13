import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { CreateResourceItemCommand } from '../commands/create-resource-item.command';
import { UpdateResourceItemCommand } from '../commands/update-resource-item.command';
import { DeleteResourceItemCommand } from '../commands/delete-resource-item.command';
import { ChangeResourceItemStatusCommand } from '../commands/change-resource-item-status.command';
// Queries
import { GetResourceItemByIdQuery } from '../queries/get-resource-item-by-id.query';
import { GetResourceItemsByResourceIdQuery } from '../queries/get-resource-items-by-resource-id.query';
import { SearchResourceItemsQuery } from '../queries/search-resource-items.query';
import { GetAvailableResourceItemsQuery } from '../queries/get-available-resource-items.query';
@Controller('resource-items')
@UseGuards(JwtAuthGuard)
export class ResourceItemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async createResourceItem(@Body() createResourceItemDto: any): Promise<any> {
    const command = new CreateResourceItemCommand(
      createResourceItemDto.resourceId,
      createResourceItemDto.name,
      createResourceItemDto.type,
      createResourceItemDto.capacity,
      createResourceItemDto.price,
      createResourceItemDto.currency || 'USD',
      createResourceItemDto.status || 'AVAILABLE',
      createResourceItemDto.description,
      createResourceItemDto.location,
      createResourceItemDto.amenities,
      createResourceItemDto.images
    );
    const resourceItem = await this.commandBus.execute(command);
    return this.mapToResponseDto(resourceItem);
  }
@Get()
          async getAllResourceItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new SearchResourceItemsQuery(
      undefined, // resourceId
      undefined, // status
      undefined, // type
      undefined, // isActive
      undefined, // minCapacity
      undefined, // maxCapacity
      undefined, // minPrice
      undefined, // maxPrice
      undefined, // location
      undefined, // amenities
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      resourceItems: (result?.items || []).map(item => this.mapToResponseDto(item)),
      pagination: result?.pagination || {
        total: result?.total || 0,
        page: result?.page || page,
        limit: result?.limit || limit
      }
    };
  }
@Get('search')
                            async searchResourceItems(
    @Query('resourceId') resourceId?: string,
    @Query('name') name?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('minCapacity') minCapacity?: number,
    @Query('maxCapacity') maxCapacity?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('location') location?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new SearchResourceItemsQuery(
      resourceId,
      status,
      type,
      undefined, // isActive
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      undefined, // amenities
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      resourceItems: (result?.items || []).map(item => this.mapToResponseDto(item)),
      pagination: result?.pagination || {
        total: result?.total || 0,
        page: result?.page || page,
        limit: result?.limit || limit
      }
    };
  }
@Get('by-resource/:resourceId')
        async getResourceItemsByResourceId(@Param('resourceId', ParseUUIDPipe) resourceId: string): Promise<any> {
    const query = new GetResourceItemsByResourceIdQuery(resourceId);
    const result = await this.queryBus.execute(query);
    return {
      resourceItems: result.resourceItems.map(item => this.mapToResponseDto(item)),
      pagination: result.pagination
    };
  }
@Get('available')
                            async getAvailableResourceItems(
    @Query('resourceId') resourceId?: string,
    @Query('type') type?: string,
    @Query('minCapacity') minCapacity?: number,
    @Query('maxCapacity') maxCapacity?: number,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('location') location?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    if (!resourceId || !startDate || !endDate) {
      return { resourceItems: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } };
    }
    
    const query = new GetAvailableResourceItemsQuery(
      resourceId,
      new Date(startDate),
      new Date(endDate),
      'AVAILABLE',
      type,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice
    );
    const result = await this.queryBus.execute(query);
    return {
      resourceItems: (result?.availableItems || []).map(item => this.mapToResponseDto(item)),
      pagination: {
        page: page,
        limit: limit,
        total: result?.totalAvailable || 0,
        totalPages: Math.ceil((result?.totalAvailable || 0) / limit)
      }
    };
  }
@Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
        async updateResourceItem(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResourceItemDto: any
  ): Promise<any> {
    const command = new UpdateResourceItemCommand(
      id,
      updateResourceItemDto.name,
      updateResourceItemDto.description,
      updateResourceItemDto.location,
      updateResourceItemDto.amenities,
      updateResourceItemDto.images
    );
    const resourceItem = await this.commandBus.execute(command);
    return this.mapToResponseDto(resourceItem);
  }
@Put(':id/status')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
        async changeResourceItemStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() statusDto: { status: string }
  ): Promise<any> {
    const command = new ChangeResourceItemStatusCommand(id, statusDto.status as any);
    const resourceItem = await this.commandBus.execute(command);
    return this.mapToResponseDto(resourceItem);
  }
@Get(':id')
        async getResourceItemById(@Param('id') id: string): Promise<any> {
    // Validate UUID format manually
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }
    
    const query = new GetResourceItemByIdQuery(id);
    const resourceItem = await this.queryBus.execute(query);
    if (!resourceItem) {
      return null;
    }
    return this.mapToResponseDto(resourceItem);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
        async deleteResourceItem(@Param('id') id: string): Promise<void> {
    // Validate UUID format manually
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }
    
    const command = new DeleteResourceItemCommand(id);
    await this.commandBus.execute(command);
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(resourceItem: any): any {
    return {
      id: resourceItem.id.value,
      resourceId: resourceItem.resourceId.value,
      name: resourceItem.name.value,
      description: resourceItem.description.value,
      type: resourceItem.type.value,
      status: resourceItem.status.value,
      capacity: resourceItem.capacity.value,
      price: resourceItem.price.value,
      currency: resourceItem.price.currency,
      location: resourceItem.location,
      amenities: resourceItem.amenities,
      images: resourceItem.images,
      metadata: resourceItem.metadata,
      isActive: resourceItem.isActive,
      createdAt: resourceItem.createdAt,
      updatedAt: resourceItem.updatedAt
    };
  }
}
