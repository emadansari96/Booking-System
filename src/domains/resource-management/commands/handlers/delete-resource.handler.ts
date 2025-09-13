import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DeleteResourceCommand } from '../delete-resource.command';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(DeleteResourceCommand)
export class DeleteResourceHandler implements ICommandHandler<DeleteResourceCommand> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(command: DeleteResourceCommand): Promise<void> {
    const { id } = command;

    // Find existing resource
    const resourceId = UuidValueObject.fromString(id);
    const existingResource = await this.resourceRepository.findById(resourceId);
    
    if (!existingResource) {
      throw new Error(`Resource with ID ${id} not found`);
    }

    // Check if resource can be deleted (business rules)
    if (existingResource.isBooked()) {
      throw new Error('Cannot delete a resource that is currently booked');
    }

    // Mark resource for deletion
    existingResource.delete();

    // Hard delete from database
    await this.resourceRepository.delete(resourceId);
  }
}
