import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteResourceItemCommand } from '../delete-resource-item.command';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';

@CommandHandler(DeleteResourceItemCommand)
export class DeleteResourceItemHandler implements ICommandHandler<DeleteResourceItemCommand> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(command: DeleteResourceItemCommand): Promise<void> {
    const resourceItem = await this.resourceItemRepository.findById(
      UuidValueObject.fromString(command.id)
    );

    if (!resourceItem) {
      throw new Error(`Resource item with ID ${command.id} not found`);
    }

    resourceItem.deactivate();
    await this.resourceItemRepository.save(resourceItem);
  }
}
