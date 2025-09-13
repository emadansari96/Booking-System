import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateResourceCommand } from '../create-resource.command';
import { ResourceEntity } from '../../entities/resource.entity';
import { ResourceName } from '../../value-objects/resource-name.value-object';
import { ResourceDescription } from '../../value-objects/resource-description.value-object';
import { ResourceCapacity } from '../../value-objects/resource-capacity.value-object';
import { ResourcePrice } from '../../value-objects/resource-price.value-object';
import { ResourceStatus } from '../../value-objects/resource-status.value-object';
import { ResourceType } from '../../value-objects/resource-type.value-object';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { ResourceDomainService } from '../../services/resource-domain.service';
@CommandHandler(CreateResourceCommand)
export class CreateResourceHandler implements ICommandHandler<CreateResourceCommand> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
    private readonly resourceDomainService: ResourceDomainService,
  ) {}

  async execute(command: CreateResourceCommand): Promise<ResourceEntity> {
    const {
      name,
      description,
      capacity,
      price,
      currency = 'USD',
      status = 'AVAILABLE',
      type,
      location,
      amenities = [],
      images = [],
    } = command;

    // Create value objects
    const resourceName = ResourceName.create(name);
    const resourceDescription = ResourceDescription.create(description);
    const resourceCapacity = ResourceCapacity.create(capacity);
    const resourcePrice = ResourcePrice.create(price, currency);
    const resourceStatus = ResourceStatus.create(status);
    const resourceType = ResourceType.create(type);

    // Check if resource with same name already exists
    await this.resourceDomainService.ensureResourceNameIsUnique(resourceName);

    // Create resource entity
    const resource = ResourceEntity.create({
      name: resourceName,
      description: resourceDescription,
      capacity: resourceCapacity,
      price: resourcePrice,
      status: resourceStatus,
      type: resourceType,
      location,
      amenities,
      images,
      isActive: true,
    });

    // Save resource
    const savedResource = await this.resourceRepository.save(resource);

    return savedResource;
  }
}
