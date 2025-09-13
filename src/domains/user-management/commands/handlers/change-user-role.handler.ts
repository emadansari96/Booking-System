import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeUserRoleCommand } from '../change-user-role.command';
import { UserDomainService } from '../../services/user-domain.service';
import { UserRoleChangedEvent } from '../../events/user-role-changed.event';
import { EventBus } from '@nestjs/cqrs';
@Injectable()
@CommandHandler(ChangeUserRoleCommand)
export class ChangeUserRoleHandler implements ICommandHandler<ChangeUserRoleCommand> {
  constructor(
    private readonly userService: UserDomainService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: ChangeUserRoleCommand) {
    // Get user before role change to capture old role
    const userBeforeChange = await this.userService.getUserById(command.id);
    if (!userBeforeChange) {
      throw new Error('User not found');
    }

    const oldRole = userBeforeChange.role.value;
    
    // Change user role
    const user = await this.userService.changeUserRole(command.id, command.role);

    // Publish domain event with correct old and new roles
    await this.eventBus.publish(new UserRoleChangedEvent(
      user.id.value,
      oldRole, // old role
      command.role // new role
    ));

    return user;
  }
}
