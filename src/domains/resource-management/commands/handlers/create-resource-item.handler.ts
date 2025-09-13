import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateResourceItemCommand } from '../create-resource-item.command';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { Inject } from '@nestjs/common';
@CommandHandler(CreateResourceItemCommand)
export class CreateResourceItemHandler implements ICommandHandler<CreateResourceItemCommand> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(command: CreateResourceItemCommand): Promise<ResourceItemEntity> {
    // Verify that the parent resource exists
    const resource = await this.resourceRepository.findById(
      UuidValueObject.fromString(command.resourceId)
    );
    
    if (!resource) {
      throw new Error(`Resource with ID ${command.resourceId} not found`);
    }

    // Create the resource item
    const resourceItem = ResourceItemEntity.create(
      UuidValueObject.generate(),
      UuidValueObject.fromString(command.resourceId),
      command.name,
      command.type as any,
      command.capacity,
      command.price,
      command.currency,
      command.status as any,
      command.description,
      command.location,
      command.amenities,
      command.images
    );

    return this.resourceItemRepository.save(resourceItem);
  }
}
