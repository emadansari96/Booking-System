import { Injectable } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeactivateUserCommand } from '../deactivate-user.command';
import { UserDomainService } from '../../services/user-domain.service';
@Injectable()
@CommandHandler(DeactivateUserCommand)
export class DeactivateUserHandler implements ICommandHandler<DeactivateUserCommand> {
  constructor(private readonly userService: UserDomainService) {}

  async execute(command: DeactivateUserCommand) {
    await this.userService.deactivateUser(command.id);
  }
}
