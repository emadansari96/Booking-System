import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ChangeResourceStatusCommand } from '../change-resource-status.command';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { ResourceStatus } from '../../value-objects/resource-status.value-object';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@CommandHandler(ChangeResourceStatusCommand)
export class ChangeResourceStatusHandler implements ICommandHandler<ChangeResourceStatusCommand> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(command: ChangeResourceStatusCommand): Promise<void> {
    const { id, status } = command;

    // Find existing resource
    const resourceId = UuidValueObject.fromString(id);
    const existingResource = await this.resourceRepository.findById(resourceId);
    
    if (!existingResource) {
      throw new Error(`Resource with ID ${id} not found`);
    }

    // Create new status value object
    const newStatus = ResourceStatus.create(status);

    // Update resource status
    existingResource.updateStatus(newStatus);

    // Save changes
    await this.resourceRepository.save(existingResource);
  }
}
