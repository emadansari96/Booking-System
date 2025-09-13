import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ResourceCommandBus } from '../cqrs/resource-command-bus';
import { ResourceQueryBus } from '../cqrs/resource-query-bus';
import { CreateResourceDto, UpdateResourceDto, ChangeResourceStatusDto, SearchResourcesDto, GetAvailableResourcesDto, GetResourceAvailabilityDto } from '../dtos/resource.dto';
import { CreateResourceCommand } from '../commands/create-resource.command';
import { UpdateResourceCommand } from '../commands/update-resource.command';
import { DeleteResourceCommand } from '../commands/delete-resource.command';
import { ChangeResourceStatusCommand } from '../commands/change-resource-status.command';
import { GetResourceByIdQuery } from '../queries/get-resource-by-id.query';
import { SearchResourcesQuery } from '../queries/search-resources.query';
import { GetAvailableResourcesQuery } from '../queries/get-available-resources.query';
import { GetResourceAvailabilityQuery } from '../queries/get-resource-availability.query';

@ApiTags('Resources')
@Controller('resources')
export class ResourceController {
  constructor(
    private readonly resourceCommandBus: ResourceCommandBus,
    private readonly resourceQueryBus: ResourceQueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new resource' })
  @ApiResponse({ status: 201, description: 'Resource created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createResource(@Body() createResourceDto: CreateResourceDto) {
    const command = new CreateResourceCommand(
      createResourceDto.name,
      createResourceDto.description,
      createResourceDto.capacity,
      createResourceDto.price,
      createResourceDto.currency,
      createResourceDto.status,
      createResourceDto.type,
      createResourceDto.location,
      createResourceDto.amenities,
      createResourceDto.images
    );
    return this.resourceCommandBus.createResource(command);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get resource by ID' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource found' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async getResourceById(@Param('id') id: string) {
    const query = new GetResourceByIdQuery(id);
    return this.resourceQueryBus.getResourceById(query);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource updated successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async updateResource(
    @Param('id') id: string,
    @Body() updateResourceDto: UpdateResourceDto,
  ) {
    const command = new UpdateResourceCommand(
      id,
      updateResourceDto.name,
      updateResourceDto.description,
      updateResourceDto.capacity,
      updateResourceDto.price,
      updateResourceDto.currency,
      updateResourceDto.status,
      updateResourceDto.type,
      updateResourceDto.location,
      updateResourceDto.amenities,
      updateResourceDto.images
    );
    return this.resourceCommandBus.updateResource(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete resource' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 204, description: 'Resource deleted successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async deleteResource(@Param('id') id: string) {
    const command = new DeleteResourceCommand(id);
    return this.resourceCommandBus.deleteResource(command);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Change resource status' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource status updated successfully' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  async changeResourceStatus(
    @Param('id') id: string,
    @Body() changeStatusDto: ChangeResourceStatusDto,
  ) {
    const command = new ChangeResourceStatusCommand(id, changeStatusDto.status);
    return this.resourceCommandBus.changeResourceStatus(command);
  }

  @Get()
  @ApiOperation({ summary: 'Search resources' })
  @ApiResponse({ status: 200, description: 'Resources found' })
  async searchResources(@Query() searchDto: SearchResourcesDto) {
    const query = new SearchResourcesQuery(
      searchDto.name,
      searchDto.type,
      searchDto.status,
      searchDto.minCapacity,
      searchDto.maxCapacity,
      searchDto.minPrice,
      searchDto.maxPrice,
      searchDto.location,
      searchDto.amenities,
      searchDto.page,
      searchDto.limit,
      searchDto.sortBy,
      searchDto.sortOrder
    );
    return this.resourceQueryBus.searchResources(query);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available resources' })
  @ApiResponse({ status: 200, description: 'Available resources found' })
  async getAvailableResources(@Query() availableDto: GetAvailableResourcesDto) {
    const query = new GetAvailableResourcesQuery(
      availableDto.type,
      availableDto.minCapacity,
      availableDto.maxCapacity,
      availableDto.minPrice,
      availableDto.maxPrice,
      availableDto.location,
      availableDto.amenities,
      availableDto.startDate ? new Date(availableDto.startDate) : undefined,
      availableDto.endDate ? new Date(availableDto.endDate) : undefined,
      availableDto.page,
      availableDto.limit,
      availableDto.sortBy,
      availableDto.sortOrder
    );
    return this.resourceQueryBus.getAvailableResources(query);
  }

  @Get(':id/availability')
  @ApiOperation({ summary: 'Check resource availability' })
  @ApiParam({ name: 'id', description: 'Resource ID' })
  @ApiResponse({ status: 200, description: 'Resource availability checked' })
  async getResourceAvailability(
    @Param('id') id: string,
    @Query() availabilityDto: GetResourceAvailabilityDto,
  ) {
    const query = new GetResourceAvailabilityQuery(
      id,
      new Date(availabilityDto.startDate),
      new Date(availabilityDto.endDate)
    );
    return this.resourceQueryBus.getResourceAvailability(query);
  }
}
