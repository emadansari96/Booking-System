// src/domains/user-management/user-management.module.ts
import { Module } from '@nestjs/common';
import { UserDomainService } from './services/user-domain.service';
import { HashingService } from '../../shared/infrastructure/security/hashing.service';
import { RedisModule } from '../../shared/infrastructure/redis/redis.module';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    RedisModule
  ],
  controllers: [],
  providers: [
    UserDomainService,
    HashingService
  ],
  exports: [UserDomainService]
})
export class UserManagementModule {}