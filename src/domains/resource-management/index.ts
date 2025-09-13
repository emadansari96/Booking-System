// Entities
export { ResourceEntity } from './entities/resource.entity';

// Value Objects
export { ResourceName } from './value-objects/resource-name.value-object';
export { ResourceDescription } from './value-objects/resource-description.value-object';
export { ResourceCapacity } from './value-objects/resource-capacity.value-object';
export { ResourcePrice } from './value-objects/resource-price.value-object';
export { ResourceStatus } from './value-objects/resource-status.value-object';
export { ResourceType } from './value-objects/resource-type.value-object';

// Commands
export { CreateResourceCommand } from './commands/create-resource.command';
export { UpdateResourceCommand } from './commands/update-resource.command';
export { DeleteResourceCommand } from './commands/delete-resource.command';
export { ChangeResourceStatusCommand } from './commands/change-resource-status.command';

// Queries
export { GetResourceByIdQuery } from './queries/get-resource-by-id.query';
export { SearchResourcesQuery } from './queries/search-resources.query';
export { GetAvailableResourcesQuery } from './queries/get-available-resources.query';
export { GetResourceAvailabilityQuery } from './queries/get-resource-availability.query';

// Events
export { ResourceCreatedEvent } from './events/resource-created.event';
export { ResourceUpdatedEvent } from './events/resource-updated.event';
export { ResourceDeletedEvent } from './events/resource-deleted.event';

// DTOs
export { 
  CreateResourceDto, 
  UpdateResourceDto, 
  ChangeResourceStatusDto, 
  SearchResourcesDto, 
  GetAvailableResourcesDto, 
  GetResourceAvailabilityDto 
} from './dtos/resource.dto';

// Services
export { ResourceDomainService } from './services/resource-domain.service';

// Interfaces
export { ResourceRepositoryInterface } from './interfaces/resource-repository.interface';

// Module
export { ResourceManagementModule } from './resource-management.module';
