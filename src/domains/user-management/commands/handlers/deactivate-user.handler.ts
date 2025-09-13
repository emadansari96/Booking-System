import { Injectable } from '@nestjs/common';
import { DeactivateUserCommand } from '../deactivate-user.command';
import { UserDomainService } from '../../services/user-domain.service';

@Injectable()
export class DeactivateUserHandler {
  constructor(private readonly userService: UserDomainService) {}

  async handle(command: DeactivateUserCommand) {
    await this.userService.deactivateUser(command.id);
  }
}
