import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBulkNotificationCommand } from '../create-bulk-notification.command';
import { NotificationService } from '../../services/notification.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(CreateBulkNotificationCommand)
export class CreateBulkNotificationHandler implements ICommandHandler<CreateBulkNotificationCommand> {
  constructor(
    private readonly notificationService: NotificationService,
  ) {}

  async execute(command: CreateBulkNotificationCommand): Promise<any> {
    const userIds = command.userIds.map(id => UuidValueObject.fromString(id));

    const result = await this.notificationService.createBulkNotifications({
      userIds,
      type: command.type,
      title: command.title,
      message: command.message,
      priority: command.priority,
      metadata: command.metadata,
      scheduledAt: command.scheduledAt,
      maxRetries: command.maxRetries,
    });

    return result;
  }
}
