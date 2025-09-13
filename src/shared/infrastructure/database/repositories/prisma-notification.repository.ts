import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationRepositoryInterface, NotificationSearchCriteria, NotificationSearchResult } from '../../../../domains/notification/interfaces/notification-repository.interface';
import { NotificationEntity } from '../../../../domains/notification/entities/notification.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { NotificationType, NotificationTypeEnum } from '../../../../domains/notification/value-objects/notification-type.value-object';
import { NotificationStatus, NotificationStatusEnum } from '../../../../domains/notification/value-objects/notification-status.value-object';
import { NotificationPriority, NotificationPriorityEnum } from '../../../../domains/notification/value-objects/notification-priority.value-object';
import { NotificationType as PrismaNotificationType, NotificationStatus as PrismaNotificationStatus, NotificationPriority as PrismaNotificationPriority } from '@prisma/client';
@Injectable()
export class PrismaNotificationRepository implements NotificationRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: NotificationEntity): Promise<NotificationEntity> {
    const data = {
      id: entity.id.value,
      userId: entity.userId.value,
      type: entity.type.value as any,
      status: entity.status.value as any,
      priority: entity.priority.value as any,
      title: entity.title,
      message: entity.message,
      email: entity.email,
      phoneNumber: entity.phoneNumber,
      metadata: entity.metadata,
      scheduledAt: entity.scheduledAt,
      sentAt: entity.sentAt,
      deliveredAt: entity.deliveredAt,
      failedAt: entity.failedAt,
      cancelledAt: entity.cancelledAt,
      failureReason: entity.failureReason,
      retryCount: entity.retryCount,
      maxRetries: entity.maxRetries,
      updatedAt: new Date(),
    };

    const saved = await this.prisma.notification.upsert({
      where: { id: entity.id.value },
      create: {
        ...data,
        createdAt: entity.createdAt,
      },
      update: data,
    });

    return this.toDomainEntity(saved);
  }

  async findById(id: UuidValueObject): Promise<NotificationEntity | null> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: id.value },
    });

    return notification ? this.toDomainEntity(notification) : null;
  }

  async findByUserId(userId: UuidValueObject): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findByType(type: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { type: type as any },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findByStatus(status: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findByPriority(priority: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { priority: priority as any },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findByDateRange(startDate?: Date, endDate?: Date): Promise<NotificationEntity[]> {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const notifications = await this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findPendingNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        status: PrismaNotificationStatus.PENDING,
        OR: [
          { scheduledAt: null },
          { scheduledAt: { lte: new Date() } }
        ]
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findSentNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status: PrismaNotificationStatus.SENT },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findDeliveredNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status: PrismaNotificationStatus.DELIVERED },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findFailedNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status: PrismaNotificationStatus.FAILED },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findCancelledNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { status: PrismaNotificationStatus.CANCELLED },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findScheduledNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        scheduledAt: { not: null },
        status: PrismaNotificationStatus.PENDING
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findOverdueNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        scheduledAt: { lt: new Date() },
        status: PrismaNotificationStatus.PENDING
      },
      orderBy: { scheduledAt: 'asc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findRetryableNotifications(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        status: PrismaNotificationStatus.FAILED,
        retryCount: { lt: 3 } // Default max retries
      },
      orderBy: { createdAt: 'asc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async search(criteria: NotificationSearchCriteria): Promise<NotificationSearchResult> {
    const where: any = {};
    
    if (criteria.userId) {
      where.userId = criteria.userId.value;
    }
    if (criteria.type) {
      where.type = criteria.type as any;
    }
    if (criteria.status) {
      where.status = criteria.status as any;
    }
    if (criteria.priority) {
      where.priority = criteria.priority as any;
    }
    if (criteria.startDate || criteria.endDate) {
      where.createdAt = {};
      if (criteria.startDate) where.createdAt.gte = criteria.startDate;
      if (criteria.endDate) where.createdAt.lte = criteria.endDate;
    }
    if (criteria.scheduledBefore) {
      where.scheduledAt = { lte: criteria.scheduledBefore };
    }
    if (criteria.scheduledAfter) {
      where.scheduledAt = { gte: criteria.scheduledAfter };
    }

    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [criteria.sortBy || 'createdAt']: (criteria.sortOrder || 'desc').toLowerCase() as 'asc' | 'desc',
        },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications: notifications.map(notification => this.toDomainEntity(notification)),
      total,
      page,
      limit,
    };
  }

  async findByUserAndType(userId: UuidValueObject, type: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { 
        userId: userId.value,
        type: type as any
      },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findRecentNotificationsByUser(userId: UuidValueObject, limit: number): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId: userId.value },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findNotificationsByEmail(email: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findNotificationsByPhoneNumber(phoneNumber: string): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { phoneNumber },
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async findAll(): Promise<NotificationEntity[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return notifications.map(notification => this.toDomainEntity(notification));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.notification.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaNotification: any): NotificationEntity {
    return NotificationEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaNotification.id),
      userId: UuidValueObject.fromString(prismaNotification.userId),
      type: NotificationType.create(prismaNotification.type as any),
      status: NotificationStatus.create(prismaNotification.status as any),
      priority: NotificationPriority.create(prismaNotification.priority as any),
      title: prismaNotification.title,
      message: prismaNotification.message,
      email: prismaNotification.email,
      phoneNumber: prismaNotification.phoneNumber,
      metadata: prismaNotification.metadata,
      scheduledAt: prismaNotification.scheduledAt,
      sentAt: prismaNotification.sentAt,
      deliveredAt: prismaNotification.deliveredAt,
      failedAt: prismaNotification.failedAt,
      cancelledAt: prismaNotification.cancelledAt,
      failureReason: prismaNotification.failureReason,
      retryCount: prismaNotification.retryCount,
      maxRetries: prismaNotification.maxRetries,
      createdAt: prismaNotification.createdAt,
      updatedAt: prismaNotification.updatedAt,
    });
  }
}
