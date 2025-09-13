import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { EmailModule } from '../../shared/infrastructure/email/email.module';
import { QueueModule } from '../../shared/infrastructure/queue/queue.module';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { PrismaNotificationRepository } from '../../shared/infrastructure/database/repositories/prisma-notification.repository';
import { PrismaOtpRepository } from '../../shared/infrastructure/database/repositories/prisma-otp.repository';
// Commands
import { CreateNotificationHandler } from './commands/handlers/create-notification.handler';
import { CreateBulkNotificationHandler } from './commands/handlers/create-bulk-notification.handler';
import { SendNotificationImmediatelyHandler } from './commands/handlers/send-notification-immediately.handler';
import { CancelNotificationHandler } from './commands/handlers/cancel-notification.handler';
import { RetryNotificationHandler } from './commands/handlers/retry-notification.handler';
import { CreateOtpHandler } from './commands/handlers/create-otp.handler';
import { VerifyOtpHandler } from './commands/handlers/verify-otp.handler';
import { MarkOtpUsedHandler } from './commands/handlers/mark-otp-used.handler';
// Queries
import { GetNotificationByIdHandler } from './queries/handlers/get-notification-by-id.handler';
import { GetNotificationsHandler } from './queries/handlers/get-notifications.handler';
import { GetNotificationStatisticsHandler } from './queries/handlers/get-notification-statistics.handler';
import { GetOtpByIdHandler } from './queries/handlers/get-otp-by-id.handler';
import { GetOtpStatisticsHandler } from './queries/handlers/get-otp-statistics.handler';
// Services
import { NotificationService } from './services/notification.service';
import { OtpService } from './services/otp.service';
// Controllers
import { NotificationController } from './controllers/notification.controller';
const CommandHandlers = [
  CreateNotificationHandler,
  CreateBulkNotificationHandler,
  SendNotificationImmediatelyHandler,
  CancelNotificationHandler,
  RetryNotificationHandler,
  CreateOtpHandler,
  VerifyOtpHandler,
  MarkOtpUsedHandler,
];

const QueryHandlers = [
  GetNotificationByIdHandler,
  GetNotificationsHandler,
  GetNotificationStatisticsHandler,
  GetOtpByIdHandler,
  GetOtpStatisticsHandler,
];
@Module({
  imports: [
    CqrsModule,
    EmailModule,
    QueueModule,
    DatabaseModule,
  ],
  controllers: [
    NotificationController,
  ],
  providers: [
    NotificationService,
    OtpService,
    PrismaNotificationRepository,
    PrismaOtpRepository,
    ...CommandHandlers,
    ...QueryHandlers,
    {
      provide: 'NotificationRepositoryInterface',
      useClass: PrismaNotificationRepository,
    },
    {
      provide: 'OtpRepositoryInterface',
      useClass: PrismaOtpRepository,
    },
  ],
  exports: [
    CqrsModule,
    NotificationService,
    OtpService,
  ],
})
export class NotificationModule {}
