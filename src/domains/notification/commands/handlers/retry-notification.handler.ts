import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RetryNotificationCommand } from '../retry-notification.command';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(RetryNotificationCommand)
export class RetryNotificationHandler implements ICommandHandler<RetryNotificationCommand> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: RetryNotificationCommand): Promise<any> {
    const result = await this.notificationService.retryFailedNotification(
      UuidValueObject.fromString(command.notificationId)
    );

    return result;
  }
}
