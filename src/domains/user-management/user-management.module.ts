import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserRoleController } from './controllers/user-role.controller';
import { UserCqrsController } from './controllers/user-cqrs.controller';
import { UserDomainService } from './services/user-domain.service';
import { UserRoleService } from './services/user-role.service';
import { HashingService } from '../../shared/infrastructure/security/hashing.service';
import { RedisModule } from '../../shared/infrastructure/redis/redis.module';
import { UserCqrsModule } from './cqrs/user-cqrs.module';
import { AuditLogCqrsModule } from '../audit-log/cqrs/audit-log-cqrs.module';

@Module({
  imports: [
    RedisModule,
    UserCqrsModule,
    AuditLogCqrsModule
  ],
  controllers: [
    UserController,
    UserRoleController,
    UserCqrsController
  ],
  providers: [
    UserDomainService,
    UserRoleService,
    HashingService
  ],
  exports: [
    UserDomainService,
    UserRoleService,
    HashingService
  ]
})
export class UserManagementModule {}
