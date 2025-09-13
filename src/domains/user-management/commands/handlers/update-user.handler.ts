import { Injectable } from '@nestjs/common';
import { UpdateUserCommand } from '../update-user.command';
import { UserDomainService } from '../../services/user-domain.service';
import { UserUpdatedEvent } from '../../events/user-updated.event';
import { EventBus } from '../../cqrs/user-event-bus';

@Injectable()
export class UpdateUserHandler {
  constructor(
    private readonly userService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: UpdateUserCommand) {
    const user = await this.userService.updateUser(command.id, {
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      avatarUrl: command.avatarUrl
    });

    // Publish domain event
    await this.eventBus.publish(new UserUpdatedEvent(
      user.id.value,
      user.email.value,
      user.name.firstName,
      user.name.lastName,
      user.phone.value,
      user.avatarUrl
    ));

    return user;
  }
}
