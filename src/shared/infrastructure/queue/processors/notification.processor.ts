import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { NotificationService } from '../../../../domains/notification/services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
export interface NotificationJobData {
  notificationId: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  priority: string;
  retryCount?: number;
}
@Processor('notifications')
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationService: NotificationService,
  ) {}
@Process('send-notification')
  async handleSendNotification(job: Job<NotificationJobData>): Promise<void> {
    const { notificationId, ...jobData } = job.data;
    
    this.logger.log(`Processing notification job: ${notificationId}`);

    try {
      const result = await this.notificationService.sendNotificationImmediately(
        UuidValueObject.fromString(notificationId)
      );

      if (result.success) {
        this.logger.log(`Notification sent successfully: ${notificationId}`);
      } else {
        this.logger.error(`Failed to send notification: ${notificationId} - ${result.message}`);
        throw new Error(result.message);
      }
    } catch (error) {
      this.logger.error(`Error processing notification job: ${notificationId}`, error);
      throw error;
    }
  }
@Process('process-pending')
  async handleProcessPending(job: Job): Promise<void> {
    this.logger.log('Processing pending notifications');

    try {
      const result = await this.notificationService.processPendingNotifications();
      
      this.logger.log(
        `Processed ${result.processed} notifications: ${result.success} success, ${result.failed} failed`
      );
    } catch (error) {
      this.logger.error('Error processing pending notifications', error);
      throw error;
    }
  }
@Process('cleanup-old')
  async handleCleanupOld(job: Job<{ daysOld: number }>): Promise<void> {
    const { daysOld } = job.data;
    
    this.logger.log(`Cleaning up notifications older than ${daysOld} days`);

    try {
      const cleanedCount = await this.notificationService.cleanupOldNotifications(daysOld);
      
      this.logger.log(`Cleaned up ${cleanedCount} old notifications`);
    } catch (error) {
      this.logger.error('Error cleaning up old notifications', error);
      throw error;
    }
  }
}
