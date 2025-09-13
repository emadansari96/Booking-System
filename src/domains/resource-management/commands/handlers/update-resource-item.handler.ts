import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateResourceItemCommand } from '../update-resource-item.command';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(UpdateResourceItemCommand)
export class UpdateResourceItemHandler implements ICommandHandler<UpdateResourceItemCommand> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(command: UpdateResourceItemCommand): Promise<ResourceItemEntity> {
    const resourceItem = await this.resourceItemRepository.findById(
      UuidValueObject.fromString(command.id)
    );

    if (!resourceItem) {
      throw new Error(`Resource item with ID ${command.id} not found`);
    }

    resourceItem.updateDetails(
      command.name,
      command.description,
      command.location,
      command.amenities,
      command.images
    );

    return this.resourceItemRepository.save(resourceItem);
  }
}
