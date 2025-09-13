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
    const resourceItemId = UuidValueObject.fromString(command.id);
    const resourceItem = await this.resourceItemRepository.findById(resourceItemId);

    if (!resourceItem) {
      throw new Error(`Resource item with ID ${command.id} not found`);
    }

    // Check if resource item can be deleted (business rules)
    if (resourceItem.isBooked()) {
      throw new Error('Cannot delete a resource item that is currently booked');
    }

    resourceItem.deactivate();

    // Hard delete from database
    await this.resourceItemRepository.delete(resourceItemId);
  }
}
