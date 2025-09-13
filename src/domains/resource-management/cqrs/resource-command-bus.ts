import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateResourceCommand } from '../commands/create-resource.command';
import { UpdateResourceCommand } from '../commands/update-resource.command';
import { DeleteResourceCommand } from '../commands/delete-resource.command';
import { ChangeResourceStatusCommand } from '../commands/change-resource-status.command';
import { ResourceEntity } from '../entities/resource.entity';

@Injectable()
export class ResourceCommandBus {
  constructor(private readonly commandBus: CommandBus) {}

  async createResource(command: CreateResourceCommand): Promise<ResourceEntity> {
    return this.commandBus.execute(command);
  }

  async updateResource(command: UpdateResourceCommand): Promise<ResourceEntity> {
    return this.commandBus.execute(command);
  }

  async deleteResource(command: DeleteResourceCommand): Promise<void> {
    return this.commandBus.execute(command);
  }

  async changeResourceStatus(command: ChangeResourceStatusCommand): Promise<void> {
    return this.commandBus.execute(command);
  }
}
