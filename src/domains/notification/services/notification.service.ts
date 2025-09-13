import { Injectable, Inject } from '@nestjs/common';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { NotificationEntity } from '../entities/notification.entity';
import { NotificationRepositoryInterface } from '../interfaces/notification-repository.interface';
import { NotificationStatus, NotificationStatusEnum } from '../value-objects/notification-status.value-object';
import { EmailService } from '../../../shared/infrastructure/email/email.service';

export interface CreateNotificationRequest {
  userId: UuidValueObject;
  type: string;
  title: string;
  message: string;
  priority?: string;
  email?: string;
  phoneNumber?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  maxRetries?: number;
}

export interface NotificationResult {
  success: boolean;
  message: string;
  notification?: NotificationEntity;
}

export interface BulkNotificationRequest {
  userIds: UuidValueObject[];
  type: string;
  title: string;
  message: string;
  priority?: string;
  metadata?: Record<string, any>;
  scheduledAt?: Date;
  maxRetries?: number;
}

export interface BulkNotificationResult {
  success: boolean;
  message: string;
  notifications: NotificationEntity[];
  successCount: number;
  failureCount: number;
}

@Injectable()
export class NotificationService {
  constructor(
    @Inject('NotificationRepositoryInterface')
    private readonly notificationRepository: NotificationRepositoryInterface,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Create notification (will be queued for sending)
   */
  async createNotification(request: CreateNotificationRequest): Promise<NotificationResult> {
    try {
      const notification = NotificationEntity.create(
        UuidValueObject.generate(),
        request.userId,
        request.type,
        request.title,
        request.message,
        request.priority || 'NORMAL',
        request.email,
        request.phoneNumber,
        request.metadata,
        request.scheduledAt,
        request.maxRetries || 3
      );

      const savedNotification = await this.notificationRepository.save(notification);

      return {
        success: true,
        message: 'Notification created successfully and queued for sending.',
        notification: savedNotification,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create notification: ${error.message}`,
      };
    }
  }

  /**
   * Create bulk notifications
   */
  async createBulkNotifications(request: BulkNotificationRequest): Promise<BulkNotificationResult> {
    try {
      const notifications: NotificationEntity[] = [];
      let successCount = 0;
      let failureCount = 0;

      for (const userId of request.userIds) {
        try {
          const notification = NotificationEntity.create(
            UuidValueObject.generate(),
            userId,
            request.type,
            request.title,
            request.message,
            request.priority || 'NORMAL',
            undefined, // email will be fetched from user profile
            undefined, // phone will be fetched from user profile
            request.metadata,
            request.scheduledAt,
            request.maxRetries || 3
          );

          const savedNotification = await this.notificationRepository.save(notification);
          notifications.push(savedNotification);
          successCount++;
        } catch (error) {
          failureCount++;
        }
      }

      return {
        success: true,
        message: `Bulk notifications created: ${successCount} success, ${failureCount} failures`,
        notifications,
        successCount,
        failureCount,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create bulk notifications: ${error.message}`,
        notifications: [],
        successCount: 0,
        failureCount: request.userIds.length,
      };
    }
  }

  /**
   * Send notification immediately (for urgent notifications)
   */
  async sendNotificationImmediately(notificationId: UuidValueObject): Promise<NotificationResult> {
    try {
      const notification = await this.notificationRepository.findById(notificationId);

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found.',
        };
      }

      if (!notification.isReadyToSend()) {
        return {
          success: false,
          message: 'Notification is not ready to send.',
        };
      }

      // Send email if available
      if (notification.hasEmail()) {
        const emailSent = await this.emailService.sendNotificationEmail(
          notification.email!,
          'User', // This should be fetched from user profile
          {
            title: notification.title,
            message: notification.message,
            type: notification.type.value,
            actionUrl: notification.metadata?.actionUrl,
          }
        );

        if (emailSent) {
          notification.markAsSent();
          await this.notificationRepository.save(notification);
        } else {
          notification.markAsFailed('Email sending failed');
          await this.notificationRepository.save(notification);
        }
      }

      return {
        success: true,
        message: 'Notification sent successfully.',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to send notification: ${error.message}`,
      };
    }
  }

  /**
   * Process pending notifications (called by queue processor)
   */
  async processPendingNotifications(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    try {
      const pendingNotifications = await this.notificationRepository.findPendingNotifications();
      let processed = 0;
      let success = 0;
      let failed = 0;

      for (const notification of pendingNotifications) {
        if (!notification.isReadyToSend()) {
          continue;
        }

        processed++;

        try {
          // Send email if available
          if (notification.hasEmail()) {
            const emailSent = await this.emailService.sendNotificationEmail(
              notification.email!,
              'User', // This should be fetched from user profile
              {
                title: notification.title,
                message: notification.message,
                type: notification.type.value,
                actionUrl: notification.metadata?.actionUrl,
              }
            );

            if (emailSent) {
              notification.markAsSent();
              await this.notificationRepository.save(notification);
              success++;
            } else {
              notification.incrementRetryCount();
              if (notification.canRetry()) {
                await this.notificationRepository.save(notification);
              } else {
                notification.markAsFailed('Email sending failed after max retries');
                await this.notificationRepository.save(notification);
                failed++;
              }
            }
          } else {
            notification.markAsFailed('No email address available');
            await this.notificationRepository.save(notification);
            failed++;
          }
        } catch (error) {
          notification.incrementRetryCount();
          if (notification.canRetry()) {
            await this.notificationRepository.save(notification);
          } else {
            notification.markAsFailed(`Processing failed: ${error.message}`);
            await this.notificationRepository.save(notification);
            failed++;
          }
        }
      }

      return { processed, success, failed };
    } catch (error) {
      throw new Error(`Failed to process pending notifications: ${error.message}`);
    }
  }

  /**
   * Cancel notification
   */
  async cancelNotification(notificationId: UuidValueObject): Promise<NotificationResult> {
    try {
      const notification = await this.notificationRepository.findById(notificationId);

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found.',
        };
      }

      notification.cancel();
      await this.notificationRepository.save(notification);

      return {
        success: true,
        message: 'Notification cancelled successfully.',
        notification,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to cancel notification: ${error.message}`,
      };
    }
  }

  /**
   * Retry failed notification
   */
  async retryFailedNotification(notificationId: UuidValueObject): Promise<NotificationResult> {
    try {
      const notification = await this.notificationRepository.findById(notificationId);

      if (!notification) {
        return {
          success: false,
          message: 'Notification not found.',
        };
      }

      if (!notification.canRetry()) {
        return {
          success: false,
          message: 'Notification cannot be retried.',
        };
      }

      // Reset status to pending for retry
      // Note: This should be done through a method in the entity
      // For now, we'll create a new entity with updated status
      const updatedNotification = NotificationEntity.fromPersistence({
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        status: NotificationStatus.create(NotificationStatusEnum.PENDING),
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        email: notification.email,
        phoneNumber: notification.phoneNumber,
        metadata: notification.metadata,
        scheduledAt: notification.scheduledAt,
        sentAt: notification.sentAt,
        deliveredAt: notification.deliveredAt,
        failedAt: notification.failedAt,
        cancelledAt: notification.cancelledAt,
        failureReason: notification.failureReason,
        retryCount: notification.retryCount,
        maxRetries: notification.maxRetries,
        createdAt: notification.createdAt,
        updatedAt: new Date(),
      });
      await this.notificationRepository.save(updatedNotification);

      return {
        success: true,
        message: 'Notification queued for retry.',
        notification: updatedNotification,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to retry notification: ${error.message}`,
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(
    userId?: UuidValueObject,
    startDate?: Date,
    endDate?: Date,
    type?: string
  ): Promise<{
    totalNotifications: number;
    pendingNotifications: number;
    sentNotifications: number;
    deliveredNotifications: number;
    failedNotifications: number;
    cancelledNotifications: number;
    successRate: number;
  }> {
    const notifications = await this.notificationRepository.findByDateRange(startDate, endDate);
    
    let filteredNotifications = notifications;
    if (userId) {
      filteredNotifications = notifications.filter(n => n.userId.equals(userId));
    }
    if (type) {
      filteredNotifications = filteredNotifications.filter(n => n.type.value === type);
    }

    const totalNotifications = filteredNotifications.length;
    const pendingNotifications = filteredNotifications.filter(n => n.isPending()).length;
    const sentNotifications = filteredNotifications.filter(n => n.isSent()).length;
    const deliveredNotifications = filteredNotifications.filter(n => n.isDelivered()).length;
    const failedNotifications = filteredNotifications.filter(n => n.isFailed()).length;
    const cancelledNotifications = filteredNotifications.filter(n => n.isCancelled()).length;
    const successRate = totalNotifications > 0 ? ((sentNotifications + deliveredNotifications) / totalNotifications) * 100 : 0;

    return {
      totalNotifications,
      pendingNotifications,
      sentNotifications,
      deliveredNotifications,
      failedNotifications,
      cancelledNotifications,
      successRate,
    };
  }

  /**
   * Clean up old notifications
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const oldNotifications = await this.notificationRepository.findByDateRange(undefined, cutoffDate);
      let cleanedCount = 0;

      for (const notification of oldNotifications) {
        if (notification.isDelivered() || notification.isFailed() || notification.isCancelled()) {
          await this.notificationRepository.delete(notification.id);
          cleanedCount++;
        }
      }

      return cleanedCount;
    } catch (error) {
      throw new Error(`Failed to cleanup old notifications: ${error.message}`);
    }
  }
}
