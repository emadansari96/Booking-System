import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetNotificationStatisticsQuery } from '../get-notification-statistics.query';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetNotificationStatisticsQuery)
export class GetNotificationStatisticsHandler implements IQueryHandler<GetNotificationStatisticsQuery> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(query: GetNotificationStatisticsQuery): Promise<any> {
    const result = await this.notificationService.getNotificationStatistics(
      query.userId ? UuidValueObject.fromString(query.userId) : undefined,
      query.startDate,
      query.endDate,
      query.type
    );

    return result;
  }
}
