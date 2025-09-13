import { Module } from '@nestjs/common';
import { PrismaUserRepository } from '../../../shared/infrastructure/database/repositories/prisma-user.repository';
import { HashingService } from '../../../shared/infrastructure/security/hashing.service';
import { RedisModule } from '../../../shared/infrastructure/redis/redis.module';
import { UserDomainService } from '../services/user-domain.service';

// Commands
import { CreateUserHandler } from '../commands/handlers/create-user.handler';
import { UpdateUserHandler } from '../commands/handlers/update-user.handler';
import { ChangeUserRoleHandler } from '../commands/handlers/change-user-role.handler';
import { DeactivateUserHandler } from '../commands/handlers/deactivate-user.handler';

// Queries
import { GetUserByIdHandler } from '../queries/handlers/get-user-by-id.handler';
import { SearchUsersHandler } from '../queries/handlers/search-users.handler';
import { GetUserActivityHandler } from '../queries/handlers/get-user-activity.handler';

// Events
import { UserCreatedHandler } from '../events/handlers/user-created.handler';
import { UserUpdatedHandler } from '../events/handlers/user-updated.handler';
import { UserRoleChangedHandler } from '../events/handlers/user-role-changed.handler';

// Buses
import { CommandBus } from './user-command-bus';
import { QueryBus } from './user-query-bus';
import { EventBus } from './user-event-bus';

@Module({
  imports: [
    RedisModule
  ],
  providers: [
    // Domain Services
    UserDomainService,
    PrismaUserRepository,
    HashingService,
    {
      provide: 'UserRepositoryInterface',
      useClass: PrismaUserRepository,
    },

    // Command Handlers
    CreateUserHandler,
    UpdateUserHandler,
    ChangeUserRoleHandler,
    DeactivateUserHandler,

    // Query Handlers
    GetUserByIdHandler,
    SearchUsersHandler,
    GetUserActivityHandler,

    // Event Handlers
    UserCreatedHandler,
    UserUpdatedHandler,
    UserRoleChangedHandler,

    // Buses
    CommandBus,
    QueryBus,
    EventBus
  ],
  exports: [CommandBus, QueryBus, EventBus]
})
export class UserCqrsModule {}
