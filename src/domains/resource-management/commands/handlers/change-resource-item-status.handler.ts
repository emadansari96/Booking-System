import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeResourceItemStatusCommand } from '../change-resource-item-status.command';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';
@CommandHandler(ChangeResourceItemStatusCommand)
export class ChangeResourceItemStatusHandler implements ICommandHandler<ChangeResourceItemStatusCommand> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(command: ChangeResourceItemStatusCommand): Promise<ResourceItemEntity> {
    const resourceItem = await this.resourceItemRepository.findById(
      UuidValueObject.fromString(command.id)
    );

    if (!resourceItem) {
      throw new Error(`Resource item with ID ${command.id} not found`);
    }

    resourceItem.changeStatus(command.status as any);

    return this.resourceItemRepository.save(resourceItem);
  }
}
