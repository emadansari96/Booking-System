import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetNotificationByIdQuery } from '../get-notification-by-id.query';
import { NotificationRepositoryInterface } from '../../interfaces/notification-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@QueryHandler(GetNotificationByIdQuery)
export class GetNotificationByIdHandler implements IQueryHandler<GetNotificationByIdQuery> {
  constructor(
    @Inject('NotificationRepositoryInterface')
    private readonly notificationRepository: NotificationRepositoryInterface,
  ) {}

  async execute(query: GetNotificationByIdQuery): Promise<any> {
    const notification = await this.notificationRepository.findById(
      UuidValueObject.fromString(query.notificationId)
    );

    return notification;
  }
}
