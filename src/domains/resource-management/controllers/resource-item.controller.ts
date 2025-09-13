import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateResourceItemCommand } from '../commands/create-resource-item.command';
import { UpdateResourceItemCommand } from '../commands/update-resource-item.command';
import { ChangeResourceItemStatusCommand } from '../commands/change-resource-item-status.command';
import { DeleteResourceItemCommand } from '../commands/delete-resource-item.command';
import { GetResourceItemByIdQuery } from '../queries/get-resource-item-by-id.query';
import { GetResourceItemsByResourceIdQuery } from '../queries/get-resource-items-by-resource-id.query';
import { SearchResourceItemsQuery } from '../queries/search-resource-items.query';
import { GetAvailableResourceItemsQuery } from '../queries/get-available-resource-items.query';
import { 
  CreateResourceItemDto, 
  UpdateResourceItemDto, 
  ChangeResourceItemStatusDto,
  ResourceItemResponseDto,
  SearchResourceItemsDto,
  GetAvailableResourceItemsDto,
  ResourceItemSearchResultDto,
  ResourceItemAvailabilityResultDto
} from '../dtos/resource-item.dto';

@Controller('resources/:resourceId/items')
export class ResourceItemController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  async createResourceItem(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() createResourceItemDto: CreateResourceItemDto
  ): Promise<ResourceItemResponseDto> {
    const command = new CreateResourceItemCommand(
      resourceId,
      createResourceItemDto.name,
      createResourceItemDto.type,
      createResourceItemDto.capacity,
      createResourceItemDto.price,
      createResourceItemDto.currency,
      createResourceItemDto.status,
      createResourceItemDto.description,
      createResourceItemDto.location,
      createResourceItemDto.amenities,
      createResourceItemDto.images
    );
    
    const resourceItem = await this.commandBus.execute(command);
    return this.mapToResponseDto(resourceItem);
  }

  @Get(':id')
  async getResourceItemById(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<ResourceItemResponseDto> {
    const query = new GetResourceItemByIdQuery(id);
    const resourceItem = await this.queryBus.execute(query);
    
    if (!resourceItem) {
      throw new Error(`Resource item with ID ${id} not found`);
    }
    
    return this.mapToResponseDto(resourceItem);
  }

  @Get()
  async getResourceItemsByResourceId(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: boolean
  ): Promise<ResourceItemResponseDto[]> {
    const query = new GetResourceItemsByResourceIdQuery(
      resourceId,
      status,
      type,
      isActive
    );
    
    const resourceItems = await this.queryBus.execute(query);
    return resourceItems.map(item => this.mapToResponseDto(item));
  }

  @Put(':id')
  async updateResourceItem(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResourceItemDto: UpdateResourceItemDto
  ): Promise<ResourceItemResponseDto> {
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
  async changeResourceItemStatus(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeResourceItemStatusDto
  ): Promise<ResourceItemResponseDto> {
    const command = new ChangeResourceItemStatusCommand(id, changeStatusDto.status);
    const resourceItem = await this.commandBus.execute(command);
    return this.mapToResponseDto(resourceItem);
  }

  @Delete(':id')
  async deleteResourceItem(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Param('id', ParseUUIDPipe) id: string
  ): Promise<void> {
    const command = new DeleteResourceItemCommand(id);
    await this.commandBus.execute(command);
  }

  @Post('search')
  async searchResourceItems(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() searchDto: SearchResourceItemsDto
  ): Promise<ResourceItemSearchResultDto> {
    const query = new SearchResourceItemsQuery(
      resourceId,
      searchDto.status,
      searchDto.type,
      searchDto.isActive,
      searchDto.minCapacity,
      searchDto.maxCapacity,
      searchDto.minPrice,
      searchDto.maxPrice,
      searchDto.location,
      searchDto.amenities,
      searchDto.page,
      searchDto.limit
    );
    
    const result = await this.queryBus.execute(query);
    return {
      items: result.items.map(item => this.mapToResponseDto(item)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  @Post('availability')
  async getAvailableResourceItems(
    @Param('resourceId', ParseUUIDPipe) resourceId: string,
    @Body() availabilityDto: GetAvailableResourceItemsDto
  ): Promise<ResourceItemAvailabilityResultDto> {
    const query = new GetAvailableResourceItemsQuery(
      resourceId,
      new Date(availabilityDto.startDate),
      new Date(availabilityDto.endDate),
      availabilityDto.status,
      availabilityDto.type,
      availabilityDto.minCapacity,
      availabilityDto.maxCapacity,
      availabilityDto.minPrice,
      availabilityDto.maxPrice
    );
    
    const result = await this.queryBus.execute(query);
    return {
      availableItems: result.availableItems.map(item => this.mapToResponseDto(item)),
      totalAvailable: result.totalAvailable,
      period: result.period,
    };
  }

  private mapToResponseDto(resourceItem: any): ResourceItemResponseDto {
    return {
      id: resourceItem.id.value,
      resourceId: resourceItem.resourceId.value,
      name: resourceItem.name.value,
      status: resourceItem.status.value,
      type: resourceItem.type.value,
      capacity: resourceItem.capacity.value,
      price: resourceItem.price.value,
      currency: resourceItem.price.currency,
      description: resourceItem.description,
      location: resourceItem.location,
      amenities: resourceItem.amenities,
      images: resourceItem.images,
      isActive: resourceItem.isActive,
      createdAt: resourceItem.createdAt,
      updatedAt: resourceItem.updatedAt,
    };
  }
}
