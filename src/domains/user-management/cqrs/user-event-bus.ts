import { Injectable } from '@nestjs/common';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserUpdatedEvent } from '../events/user-updated.event';
import { UserRoleChangedEvent } from '../events/user-role-changed.event';
import { UserCreatedHandler } from '../events/handlers/user-created.handler';
import { UserUpdatedHandler } from '../events/handlers/user-updated.handler';
import { UserRoleChangedHandler } from '../events/handlers/user-role-changed.handler';

@Injectable()
export class EventBus {
  constructor(
    private readonly userCreatedHandler: UserCreatedHandler,
    private readonly userUpdatedHandler: UserUpdatedHandler,
    private readonly userRoleChangedHandler: UserRoleChangedHandler
  ) {}

  async publish(event: UserCreatedEvent): Promise<void>;
  async publish(event: UserUpdatedEvent): Promise<void>;
  async publish(event: UserRoleChangedEvent): Promise<void>;
  async publish(event: UserCreatedEvent | UserUpdatedEvent | UserRoleChangedEvent): Promise<void> {
    if (event instanceof UserCreatedEvent) {
      await this.userCreatedHandler.handle(event);
    } else if (event instanceof UserUpdatedEvent) {
      await this.userUpdatedHandler.handle(event);
    } else if (event instanceof UserRoleChangedEvent) {
      await this.userRoleChangedHandler.handle(event);
    }
  }
}
