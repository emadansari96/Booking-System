// src/domains/user-management/user-management.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from '../user-management/controllers/user.controller';
import { UserDomainService } from './services/user-domain.service';
import { TypeOrmUserRepository } from '../../shared/infrastructure/database/repositories/user.repository';
import { UserEntity } from '../../shared/infrastructure/database/entities/user.entity';
import { HashingService } from '../../shared/infrastructure/security/hashing.service';
import { RedisModule } from '../../shared/infrastructure/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    RedisModule
  ],
  controllers: [UserController],
  providers: [
    UserDomainService,
    TypeOrmUserRepository,
    HashingService
  ],
  exports: [UserDomainService, TypeOrmUserRepository]
})
export class UserManagementModule {}