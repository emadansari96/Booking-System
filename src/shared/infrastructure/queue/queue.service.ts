import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { UuidValueObject } from '../../domain/base/value-objects/uuid.value-object';
import { NotificationEntity } from '../../../domains/notification/entities/notification.entity';
export interface QueueNotificationJob {
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
@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('notifications')
    private readonly notificationQueue: Queue,
  ) {}

  /**
   * Add notification to queue
   */
  async addNotificationToQueue(
    notification: NotificationEntity,
    delay?: number
  ): Promise<void> {
    const jobData: QueueNotificationJob = {
      notificationId: notification.id.value,
      userId: notification.userId.value,
      type: notification.type.value,
      title: notification.title,
      message: notification.message,
      email: notification.email,
      phoneNumber: notification.phoneNumber,
      metadata: notification.metadata,
      priority: notification.priority.value,
      retryCount: notification.retryCount,
    };

    const jobOptions: any = {
      priority: this.getJobPriority(notification.priority.value),
      attempts: notification.maxRetries,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: 10,
      removeOnFail: 5,
    };

    if (delay) {
      jobOptions.delay = delay;
    }

    await this.notificationQueue.add('send-notification', jobData, jobOptions);
  }

  /**
   * Add bulk notifications to queue
   */
  async addBulkNotificationsToQueue(
    notifications: NotificationEntity[],
    delay?: number
  ): Promise<void> {
    const jobs = notifications.map(notification => ({
      name: 'send-notification',
      data: {
        notificationId: notification.id.value,
        userId: notification.userId.value,
        type: notification.type.value,
        title: notification.title,
        message: notification.message,
        email: notification.email,
        phoneNumber: notification.phoneNumber,
        metadata: notification.metadata,
        priority: notification.priority.value,
        retryCount: notification.retryCount,
      } as QueueNotificationJob,
      opts: {
        priority: this.getJobPriority(notification.priority.value),
        attempts: notification.maxRetries,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 10,
        removeOnFail: 5,
        delay: delay || 0,
      },
    }));

    await this.notificationQueue.addBulk(jobs);
  }

  /**
   * Schedule notification processing
   */
  async scheduleNotificationProcessing(): Promise<void> {
    await this.notificationQueue.add(
      'process-pending',
      {},
      {
        repeat: { every: 30000 }, // Every 30 seconds
        removeOnComplete: 1,
        removeOnFail: 1,
      }
    );
  }

  /**
   * Schedule cleanup job
   */
  async scheduleCleanupJob(daysOld: number = 30): Promise<void> {
    await this.notificationQueue.add(
      'cleanup-old',
      { daysOld },
      {
        repeat: { cron: '0 2 * * *' }, // Daily at 2 AM
        removeOnComplete: 1,
        removeOnFail: 1,
      }
    );
  }

  /**
   * Get queue statistics
   */
  async getQueueStatistics(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.notificationQueue.getWaiting(),
      this.notificationQueue.getActive(),
      this.notificationQueue.getCompleted(),
      this.notificationQueue.getFailed(),
      this.notificationQueue.getDelayed(),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
    };
  }

  /**
   * Clear queue
   */
  async clearQueue(): Promise<void> {
    await this.notificationQueue.empty();
  }

  /**
   * Pause queue
   */
  async pauseQueue(): Promise<void> {
    await this.notificationQueue.pause();
  }

  /**
   * Resume queue
   */
  async resumeQueue(): Promise<void> {
    await this.notificationQueue.resume();
  }

  /**
   * Get job by ID
   */
  async getJob(jobId: string): Promise<any> {
    return await this.notificationQueue.getJob(jobId);
  }

  /**
   * Remove job by ID
   */
  async removeJob(jobId: string): Promise<void> {
    const job = await this.notificationQueue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  /**
   * Retry failed job
   */
  async retryJob(jobId: string): Promise<void> {
    const job = await this.notificationQueue.getJob(jobId);
    if (job) {
      await job.retry();
    }
  }

  /**
   * Get job priority based on notification priority
   */
  private getJobPriority(priority: string): number {
    switch (priority) {
      case 'URGENT':
        return 1;
      case 'HIGH':
        return 2;
      case 'NORMAL':
        return 3;
      case 'LOW':
        return 4;
      default:
        return 3;
    }
  }
}
