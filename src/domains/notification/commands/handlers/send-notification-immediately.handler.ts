import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendNotificationImmediatelyCommand } from '../send-notification-immediately.command';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(SendNotificationImmediatelyCommand)
export class SendNotificationImmediatelyHandler implements ICommandHandler<SendNotificationImmediatelyCommand> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: SendNotificationImmediatelyCommand): Promise<any> {
    const result = await this.notificationService.sendNotificationImmediately(
      UuidValueObject.fromString(command.notificationId)
    );

    return result;
  }
}
