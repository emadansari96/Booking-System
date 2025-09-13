import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateNotificationCommand } from '../create-notification.command';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CreateNotificationCommand)
export class CreateNotificationHandler implements ICommandHandler<CreateNotificationCommand> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: CreateNotificationCommand): Promise<any> {
    const result = await this.notificationService.createNotification({
      userId: UuidValueObject.fromString(command.userId),
      type: command.type,
      title: command.title,
      message: command.message,
      priority: command.priority,
      email: command.email,
      phoneNumber: command.phoneNumber,
      metadata: command.metadata,
      scheduledAt: command.scheduledAt,
      maxRetries: command.maxRetries,
    });

    return result;
  }
}
