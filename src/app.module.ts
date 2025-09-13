import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

// Domain Modules
import { UserManagementModule } from './domains/user-management/user-management.module';
import { UserRoleModule } from './domains/user-management/user-role.module';
import { ResourceManagementModule } from './domains/resource-management/resource-management.module';
import { PricingModule } from './domains/pricing/pricing.module';
import { PaymentModule } from './domains/payment/payment.module';
import { NotificationModule } from './domains/notification/notification.module';
import { AuditLogModule } from './domains/audit-log/audit-log.module';

// Shared Modules
import { DatabaseModule } from './shared/infrastructure/database/database.module';
import { MongoDBModule } from './shared/infrastructure/mongodb/mongodb.module';
import { RedisModule } from './shared/infrastructure/redis/redis.module';
import { ConfigurationModule } from './shared/infrastructure/configuration/configuration.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Shared Modules
    DatabaseModule,
    MongoDBModule,
    RedisModule,
    ConfigurationModule,

    // Domain Modules
    UserManagementModule,
    UserRoleModule,
    ResourceManagementModule,
    PricingModule,
    PaymentModule,
    NotificationModule,
    AuditLogModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}