import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaUserRepository } from '../../../shared/infrastructure/database/repositories/prisma-user.repository';
import { HashingService } from '../../../shared/infrastructure/security/hashing.service';
import { RedisModule } from '../../../shared/infrastructure/redis/redis.module';
import { UserDomainService } from '../services/user-domain.service';
import { DatabaseModule } from '../../../shared/infrastructure/database/database.module';
import { AuditLogCqrsModule } from '../../audit-log/cqrs/audit-log-cqrs.module';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
// Commands
import { CreateUserHandler } from '../commands/handlers/create-user.handler';
import { UpdateUserHandler } from '../commands/handlers/update-user.handler';
import { ChangeUserRoleHandler } from '../commands/handlers/change-user-role.handler';
import { DeactivateUserHandler } from '../commands/handlers/deactivate-user.handler';
// Queries
import { GetUserByIdHandler } from '../queries/handlers/get-user-by-id.handler';
import { GetUserByEmailHandler } from '../handlers/queries/get-user-by-email.handler';
import { SearchUsersHandler } from '../queries/handlers/search-users.handler';
import { GetUserActivityHandler } from '../queries/handlers/get-user-activity.handler';
// Events
import { UserCreatedHandler } from '../events/handlers/user-created.handler';
import { UserUpdatedHandler } from '../events/handlers/user-updated.handler';
import { UserRoleChangedHandler } from '../events/handlers/user-role-changed.handler';
// Buses - Using NestJS CQRS built-in buses
// import { CommandBus } from './user-command-bus';
// import { QueryBus } from './user-query-bus';
// import { EventBus } from './user-event-bus';
@Module({
  imports: [
    CqrsModule,
    RedisModule,
    DatabaseModule,
    AuditLogCqrsModule
  ],
  providers: [
    // Domain Services
    UserDomainService,
    PrismaUserRepository,
    HashingService,
    AuditLogService,
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
    GetUserByEmailHandler,
    SearchUsersHandler,
    GetUserActivityHandler,

    // Event Handlers
    UserCreatedHandler,
    UserUpdatedHandler,
    UserRoleChangedHandler,

    // Buses - Remove custom buses and use NestJS built-in buses
    // CommandBus,
    // QueryBus,
    // EventBus
  ],
  exports: [
    // Export handlers for global registration
    GetUserByIdHandler,
    GetUserByEmailHandler,
    SearchUsersHandler,
    GetUserActivityHandler,
    CreateUserHandler,
    UpdateUserHandler,
    ChangeUserRoleHandler,
    DeactivateUserHandler,
    UserCreatedHandler,
    UserUpdatedHandler,
    UserRoleChangedHandler
  ]
})
export class UserCqrsModule {}
