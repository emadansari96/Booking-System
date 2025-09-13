import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationsQuery } from '../get-notifications.query';
import { NotificationRepositoryInterface } from '../../interfaces/notification-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetNotificationsQuery)
export class GetNotificationsHandler implements IQueryHandler<GetNotificationsQuery> {
  constructor(
    @Inject('NotificationRepositoryInterface')
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(query: GetNotificationsQuery): Promise<any> {
    const criteria = {
      userId: query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      type: query.type,
      status: query.status,
      priority: query.priority,
      startDate: query.startDate,
      endDate: query.endDate,
      page: query.page || 1,
      limit: query.limit || 10,
      sortBy: query.sortBy || 'createdAt',
      sortOrder: query.sortOrder || 'DESC',
    };

    const result = await this.notificationRepository.search(criteria);

    return result;
  }
}
