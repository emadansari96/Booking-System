import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe, UsePipes, ValidationPipe, HttpStatus, HttpCode } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
// Commands
import { CreateResourceCommand } from '../commands/create-resource.command';
import { UpdateResourceCommand } from '../commands/update-resource.command';
import { DeleteResourceCommand } from '../commands/delete-resource.command';
import { ChangeResourceStatusCommand } from '../commands/change-resource-status.command';
// Queries
import { GetResourceByIdQuery } from '../queries/get-resource-by-id.query';
import { SearchResourcesQuery } from '../queries/search-resources.query';
import { GetAvailableResourcesQuery } from '../queries/get-available-resources.query';
import { GetResourceAvailabilityQuery } from '../queries/get-resource-availability.query';
@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async createResource(@Body() createResourceDto: any): Promise<any> {
    const command = new CreateResourceCommand(
      createResourceDto.name,
      createResourceDto.description,
      createResourceDto.capacity,
      createResourceDto.price,
      createResourceDto.currency || 'USD',
      createResourceDto.status || 'AVAILABLE',
      createResourceDto.type,
      createResourceDto.location,
      createResourceDto.amenities,
      createResourceDto.images
    );
    const resource = await this.commandBus.execute(command);
    return this.mapToResponseDto(resource);
  }
@Get()
          async getAllResources(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new SearchResourcesQuery(
      undefined, // name
      undefined, // type
      undefined, // status
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
      resources: result.resources.map(resource => this.mapToResponseDto(resource)),
      pagination: result.pagination
    };
  }
@Get('search')
                            async searchResources(
    @Query('query') query?: string,
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
    const searchQuery = new SearchResourcesQuery(
      query || name,
      type as any,
      status as any,
      minCapacity,
      maxCapacity,
      minPrice,
      maxPrice,
      location,
      undefined, // amenities
      page,
      limit
    );
    const result = await this.queryBus.execute(searchQuery);
    return {
      resources: result.resources.map(resource => this.mapToResponseDto(resource)),
      pagination: result.pagination
    };
  }
@Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
        async updateResource(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateResourceDto: any
  ): Promise<any> {
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
    const resource = await this.commandBus.execute(command);
    return this.mapToResponseDto(resource);
  }
@Get(':id')
        async getResourceById(@Param('id') id: string): Promise<any> {
    // Validate UUID format manually
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }
    
    const query = new GetResourceByIdQuery(id);
    const resource = await this.queryBus.execute(query);
    if (!resource) {
      return null;
    }
    return this.mapToResponseDto(resource);
  }
@Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
        async deleteResource(@Param('id') id: string): Promise<void> {
    // Validate UUID format manually
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new Error('Invalid UUID format');
    }
    
    const command = new DeleteResourceCommand(id);
    await this.commandBus.execute(command);
  }
@Get(':id/availability')
            async getResourceAvailability(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<any> {
    const query = new GetResourceAvailabilityQuery(
      id,
      startDate ? new Date(startDate) : new Date(),
      endDate ? new Date(endDate) : new Date()
    );
    return await this.queryBus.execute(query);
  }
@Get('available')
                async getAvailableResources(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('capacity') capacity?: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ): Promise<any> {
    const query = new GetAvailableResourcesQuery(
      undefined, // type
      undefined, // minCapacity
      capacity, // maxCapacity
      undefined, // minPrice
      undefined, // maxPrice
      undefined, // location
      undefined, // amenities
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return {
      resources: result.resources.map(resource => this.mapToResponseDto(resource)),
      pagination: result.pagination
    };
  }

  // Helper method to map domain entity to response DTO
  private mapToResponseDto(resource: any): any {
    return {
      id: resource.id.value,
      name: resource.name.value,
      description: resource.description.value,
      capacity: resource.capacity.value,
      price: resource.price.value,
      currency: resource.price.currency,
      status: resource.status.value,
      type: resource.type.value,
      location: resource.location,
      amenities: resource.amenities,
      images: resource.images,
      isActive: resource.isActive,
      createdAt: resource.createdAt,
      updatedAt: resource.updatedAt
    };
  }
}
