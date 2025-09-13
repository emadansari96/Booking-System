import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { NotificationEntity } from '../entities/notification.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
export interface NotificationSearchCriteria {
  userId?: UuidValueObject;
  type?: string;
  status?: string;
  priority?: string;
  startDate?: Date;
  endDate?: Date;
  scheduledBefore?: Date;
  scheduledAfter?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'scheduledAt' | 'priority' | 'status';
  sortOrder?: 'ASC' | 'DESC';
}

export interface NotificationSearchResult {
  notifications: NotificationEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface NotificationRepositoryInterface extends RepositoryInterface<NotificationEntity> {
  findById(id: UuidValueObject): Promise<NotificationEntity | null>;
  findByUserId(userId: UuidValueObject): Promise<NotificationEntity[]>;
  findByType(type: string): Promise<NotificationEntity[]>;
  findByStatus(status: string): Promise<NotificationEntity[]>;
  findByPriority(priority: string): Promise<NotificationEntity[]>;
  findByDateRange(startDate?: Date, endDate?: Date): Promise<NotificationEntity[]>;
  findPendingNotifications(): Promise<NotificationEntity[]>;
  findSentNotifications(): Promise<NotificationEntity[]>;
  findDeliveredNotifications(): Promise<NotificationEntity[]>;
  findFailedNotifications(): Promise<NotificationEntity[]>;
  findCancelledNotifications(): Promise<NotificationEntity[]>;
  findScheduledNotifications(): Promise<NotificationEntity[]>;
  findOverdueNotifications(): Promise<NotificationEntity[]>;
  findRetryableNotifications(): Promise<NotificationEntity[]>;
  search(criteria: NotificationSearchCriteria): Promise<NotificationSearchResult>;
  findByUserAndType(userId: UuidValueObject, type: string): Promise<NotificationEntity[]>;
  findRecentNotificationsByUser(userId: UuidValueObject, limit: number): Promise<NotificationEntity[]>;
  findNotificationsByEmail(email: string): Promise<NotificationEntity[]>;
  findNotificationsByPhoneNumber(phoneNumber: string): Promise<NotificationEntity[]>;
}
