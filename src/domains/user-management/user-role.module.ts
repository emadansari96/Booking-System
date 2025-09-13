// src/domains/user-management/user-role.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRoleController } from './controllers/user-role.controller';
import { UserRoleService } from './services/user-role.service';
import { UserDomainService } from './services/user-domain.service';
import { TypeOrmUserRepository } from '../../shared/infrastructure/database/repositories/user.repository';
import { UserEntity } from '../../shared/infrastructure/database/entities/user.entity';
import { HashingService } from '../../shared/infrastructure/security/hashing.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity])
  ],
  controllers: [UserRoleController],
  providers: [
    UserRoleService,
    UserDomainService,
    TypeOrmUserRepository,
    HashingService
  ],
  exports: [UserRoleService]
})
export class UserRoleModule {}