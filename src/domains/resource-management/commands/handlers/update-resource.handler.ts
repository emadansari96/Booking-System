import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UpdateResourceCommand } from '../update-resource.command';
import { ResourceEntity } from '../../entities/resource.entity';
import { ResourceName } from '../../value-objects/resource-name.value-object';
import { ResourceDescription } from '../../value-objects/resource-description.value-object';
import { ResourceCapacity } from '../../value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../../value-objects/resource-price.value-object';
import { ResourceStatus } from '../../value-objects/resource-status.value-object';
import { ResourceType } from '../../value-objects/resource-type.value-object';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { ResourceDomainService } from '../../services/resource-domain.service';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
@CommandHandler(UpdateResourceCommand)
export class UpdateResourceHandler implements ICommandHandler<UpdateResourceCommand> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
    private readonly resourceDomainService: ResourceDomainService,
  ) {}

  async execute(command: UpdateResourceCommand): Promise<ResourceEntity> {
    const { id, ...updateData } = command;

    // Find existing resource
    const resourceId = UuidValueObject.fromString(id);
    const existingResource = await this.resourceRepository.findById(resourceId);
    
    if (!existingResource) {
      throw new Error(`Resource with ID ${id} not found`);
    }

    // Update fields if provided
    if (updateData.name) {
      const resourceName = ResourceName.create(updateData.name);
      await this.resourceDomainService.ensureResourceNameIsUnique(resourceName, id);
      existingResource.updateName(resourceName);
    }

    if (updateData.description) {
      const resourceDescription = ResourceDescription.create(updateData.description);
      existingResource.updateDescription(resourceDescription);
    }

    if (updateData.capacity !== undefined) {
      const resourceCapacity = ResourceCapacity.create(updateData.capacity);
      existingResource.updateCapacity(resourceCapacity);
    }

    if (updateData.price !== undefined) {
      const resourcePrice = ResourcePrice.create(updateData.price, updateData.currency || 'USD');
      existingResource.updatePrice(resourcePrice);
    }

    if (updateData.status) {
      const resourceStatus = ResourceStatus.create(updateData.status);
      existingResource.updateStatus(resourceStatus);
    }

    if (updateData.type) {
      const resourceType = ResourceType.create(updateData.type);
      // Note: Type change might need additional business logic validation
    }

    if (updateData.location !== undefined) {
      existingResource.updateLocation(updateData.location);
    }

    if (updateData.amenities !== undefined) {
      existingResource.updateAmenities(updateData.amenities);
    }

    if (updateData.images !== undefined) {
      existingResource.updateImages(updateData.images);
    }

    // Save updated resource
    const updatedResource = await this.resourceRepository.save(existingResource);

    return updatedResource;
  }
}
