import { Injectable } from '@nestjs/common';
import { CreateUserCommand } from '../commands/create-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { ChangeUserRoleCommand } from '../commands/change-user-role.command';
import { DeactivateUserCommand } from '../commands/deactivate-user.command';
import { CreateUserHandler } from '../commands/handlers/create-user.handler';
import { UpdateUserHandler } from '../commands/handlers/update-user.handler';
import { ChangeUserRoleHandler } from '../commands/handlers/change-user-role.handler';
import { DeactivateUserHandler } from '../commands/handlers/deactivate-user.handler';

@Injectable()
export class CommandBus {
  constructor(
    private readonly createUserHandler: CreateUserHandler,
    private readonly updateUserHandler: UpdateUserHandler,
    private readonly changeUserRoleHandler: ChangeUserRoleHandler,
    private readonly deactivateUserHandler: DeactivateUserHandler
  ) {}

  async execute(command: CreateUserCommand): Promise<any>;
  async execute(command: UpdateUserCommand): Promise<any>;
  async execute(command: ChangeUserRoleCommand): Promise<any>;
  async execute(command: DeactivateUserCommand): Promise<void>;
  async execute(command: CreateUserCommand | UpdateUserCommand | ChangeUserRoleCommand | DeactivateUserCommand): Promise<any> {
    if (command instanceof CreateUserCommand) {
      return await this.createUserHandler.handle(command);
    } else if (command instanceof UpdateUserCommand) {
      return await this.updateUserHandler.handle(command);
    } else if (command instanceof ChangeUserRoleCommand) {
      return await this.changeUserRoleHandler.handle(command);
    } else if (command instanceof DeactivateUserCommand) {
      return await this.deactivateUserHandler.handle(command);
    }
  }
}
