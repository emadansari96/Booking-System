// src/domains/user-management/user-role.module.ts
import { Module } from '@nestjs/common';
import { UserRoleService } from './services/user-role.service';
import { UserDomainService } from './services/user-domain.service';
import { PrismaUserRepository } from '../../shared/infrastructure/database/repositories/prisma-user.repository';
import { HashingService } from '../../shared/infrastructure/security/hashing.service';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { AuditLogCqrsModule } from '../audit-log/cqrs/audit-log-cqrs.module';
import { AuditLogService } from '../audit-log/services/audit-log.service';
import { CqrsModule } from '@nestjs/cqrs';
@Module({
  imports: [
    DatabaseModule,
    AuditLogCqrsModule,
    CqrsModule
  ],
  controllers: [],
  providers: [
    UserRoleService,
    UserDomainService,
    PrismaUserRepository,
    HashingService,
    AuditLogService
  ],
  exports: [UserRoleService, CqrsModule]
})
export class UserRoleModule {}