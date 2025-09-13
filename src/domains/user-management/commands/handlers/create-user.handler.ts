import { Injectable } from '@nestjs/common';
import { CreateUserCommand } from '../create-user.command';
import { UserDomainService } from '../../services/user-domain.service';
import { UserCreatedEvent } from '../../events/user-created.event';
import { EventBus } from '../../cqrs/user-event-bus';

@Injectable()
export class CreateUserHandler {
  constructor(
    private readonly userService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async handle(command: CreateUserCommand) {
    const user = await this.userService.createUser({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      role: command.role,
      avatarUrl: command.avatarUrl
    });

    // Publish domain event
    await this.eventBus.publish(new UserCreatedEvent(
      user.id.value,
      user.email.value,
      user.name.firstName,
      user.name.lastName,
      user.phone.value,
      user.role.value,
      user.avatarUrl
    ));

    return user;
  }
}
