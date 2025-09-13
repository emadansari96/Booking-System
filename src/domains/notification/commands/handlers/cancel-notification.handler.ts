import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CancelNotificationCommand } from '../cancel-notification.command';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CancelNotificationCommand)
export class CancelNotificationHandler implements ICommandHandler<CancelNotificationCommand> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: CancelNotificationCommand): Promise<any> {
    const result = await this.notificationService.cancelNotification(
      UuidValueObject.fromString(command.notificationId)
    );

    return result;
  }
}
