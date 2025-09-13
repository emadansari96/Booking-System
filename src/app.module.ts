import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_PIPE, APP_GUARD, APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { CustomValidationPipe } from './shared/pipes/validation.pipe';
// Domain Modules
import { AuthModule } from './domains/auth/auth.module';
import { UserManagementModule } from './domains/user-management/user-management.module';
import { UserRoleModule } from './domains/user-management/user-role.module';
import { ResourceManagementModule } from './domains/resource-management/resource-management.module';
import { BookingModule } from './domains/booking/booking.module';
import { PricingModule } from './domains/pricing/pricing.module';
import { PaymentModule } from './domains/payment/payment.module';
import { NotificationModule } from './domains/notification/notification.module';
import { AuditLogModule } from './domains/audit-log/audit-log.module';
import { ExpiryModule } from './domains/expiry/expiry.module';
// New Controllers
import { HealthController } from './shared/controllers/health.controller';
import { ResourceController } from './domains/resource-management/controllers/resource.controller';
import { ResourceItemController } from './domains/resource-management/controllers/resource-item.controller';
import { BookingController } from './domains/booking/controllers/booking.controller';
import { PaymentController } from './domains/payment/controllers/payment.controller';
import { InvoiceController } from './domains/payment/controllers/invoice.controller';
import { NotificationController } from './domains/notification/controllers/notification.controller';
import { CommissionStrategyController } from './domains/pricing/controllers/commission-strategy.controller';
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
    ScheduleModule.forRoot(),
    DatabaseModule,
    MongoDBModule,
    RedisModule,
    ConfigurationModule,

    // Domain Modules
    AuthModule,
    UserManagementModule,
    UserRoleModule,
    ResourceManagementModule,
    BookingModule,
    PricingModule,
    PaymentModule,
    NotificationModule,
    AuditLogModule,
    ExpiryModule,
  ],
  controllers: [
    HealthController,
    ResourceController,
    ResourceItemController,
    BookingController,
    PaymentController,
    InvoiceController,
    NotificationController,
    CommissionStrategyController,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomValidationPipe,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule {}