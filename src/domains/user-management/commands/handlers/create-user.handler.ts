import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '../create-user.command';
import { UserDomainService } from '../../services/user-domain.service';
import { UserCreatedEvent } from '../../events/user-created.event';
import { EventBus } from '@nestjs/cqrs';
@Injectable()
@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    private readonly userService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: CreateUserCommand) {
    const user = await this.userService.createUser({
      email: command.email,
      firstName: command.firstName,
      lastName: command.lastName,
      phone: command.phone,
      password: command.password,
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
