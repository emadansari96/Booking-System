import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

// Commands
import { CreateResourceHandler } from '../commands/handlers/create-resource.handler';
import { UpdateResourceHandler } from '../commands/handlers/update-resource.handler';
import { DeleteResourceHandler } from '../commands/handlers/delete-resource.handler';
import { ChangeResourceStatusHandler } from '../commands/handlers/change-resource-status.handler';

// Resource Item Commands
import { CreateResourceItemHandler } from '../commands/handlers/create-resource-item.handler';
import { UpdateResourceItemHandler } from '../commands/handlers/update-resource-item.handler';
import { DeleteResourceItemHandler } from '../commands/handlers/delete-resource-item.handler';
import { ChangeResourceItemStatusHandler } from '../commands/handlers/change-resource-item-status.handler';

// Queries
import { GetResourceByIdHandler } from '../queries/handlers/get-resource-by-id.handler';
import { SearchResourcesHandler } from '../queries/handlers/search-resources.handler';
import { GetAvailableResourcesHandler } from '../queries/handlers/get-available-resources.handler';
import { GetResourceAvailabilityHandler } from '../queries/handlers/get-resource-availability.handler';

// Resource Item Queries
import { GetResourceItemByIdHandler } from '../queries/handlers/get-resource-item-by-id.handler';
import { GetResourceItemsByResourceIdHandler } from '../queries/handlers/get-resource-items-by-resource-id.handler';
import { SearchResourceItemsHandler } from '../queries/handlers/search-resource-items.handler';
import { GetAvailableResourceItemsHandler } from '../queries/handlers/get-available-resource-items.handler';

// Events
import { ResourceCreatedHandler } from '../events/handlers/resource-created.handler';
import { ResourceUpdatedHandler } from '../events/handlers/resource-updated.handler';
import { ResourceDeletedHandler } from '../events/handlers/resource-deleted.handler';

// Resource Item Events
import { ResourceItemCreatedHandler } from '../events/handlers/resource-item-created.handler';
import { ResourceItemUpdatedHandler } from '../events/handlers/resource-item-updated.handler';
import { ResourceItemDeletedHandler } from '../events/handlers/resource-item-deleted.handler';
import { ResourceItemStatusChangedHandler } from '../events/handlers/resource-item-status-changed.handler';

// Buses
import { ResourceCommandBus } from './resource-command-bus';
import { ResourceQueryBus } from './resource-query-bus';
import { ResourceEventBus } from './resource-event-bus';

// Services
import { ResourceDomainService } from '../services/resource-domain.service';

// Repositories
import { ResourceRepositoryInterface } from '../interfaces/resource-repository.interface';
import { ResourceItemRepositoryInterface } from '../interfaces/resource-item-repository.interface';
import { PrismaResourceRepository } from '../../../shared/infrastructure/database/repositories/prisma-resource.repository';
import { PrismaResourceItemRepository } from '../../../shared/infrastructure/database/repositories/prisma-resource-item.repository';

const CommandHandlers = [
  CreateResourceHandler,
  UpdateResourceHandler,
  DeleteResourceHandler,
  ChangeResourceStatusHandler,
  CreateResourceItemHandler,
  UpdateResourceItemHandler,
  DeleteResourceItemHandler,
  ChangeResourceItemStatusHandler,
];

const QueryHandlers = [
  GetResourceByIdHandler,
  SearchResourcesHandler,
  GetAvailableResourcesHandler,
  GetResourceAvailabilityHandler,
  GetResourceItemByIdHandler,
  GetResourceItemsByResourceIdHandler,
  SearchResourceItemsHandler,
  GetAvailableResourceItemsHandler,
];

const EventHandlers = [
  ResourceCreatedHandler,
  ResourceUpdatedHandler,
  ResourceDeletedHandler,
  ResourceItemCreatedHandler,
  ResourceItemUpdatedHandler,
  ResourceItemDeletedHandler,
  ResourceItemStatusChangedHandler,
];

@Module({
  imports: [CqrsModule],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    ...EventHandlers,
    ResourceCommandBus,
    ResourceQueryBus,
    ResourceEventBus,
    ResourceDomainService,
    {
      provide: 'ResourceRepositoryInterface',
      useClass: PrismaResourceRepository,
    },
    {
      provide: 'ResourceItemRepositoryInterface',
      useClass: PrismaResourceItemRepository,
    },
  ],
  exports: [
    ResourceCommandBus,
    ResourceQueryBus,
    ResourceEventBus,
    ResourceDomainService,
    'ResourceRepositoryInterface',
    'ResourceItemRepositoryInterface',
  ],
})
export class ResourceCqrsModule {}
