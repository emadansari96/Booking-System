import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationProcessor } from './processors/notification.processor';
import { QueueService } from './queue.service';
import { NotificationService } from '../../../domains/notification/services/notification.service';
import { DatabaseModule } from '../database/database.module';
import { EmailService } from '../email/email.service';
@Module({
  imports: [
    DatabaseModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('REDIS_HOST', 'localhost'),
          port: configService.get<number>('REDIS_PORT', 6379),
          password: configService.get<string>('REDIS_PASSWORD'),
          db: configService.get<number>('REDIS_DB', 0),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  providers: [NotificationProcessor, QueueService, NotificationService, EmailService],
  exports: [BullModule, QueueService],
})
export class QueueModule {}
