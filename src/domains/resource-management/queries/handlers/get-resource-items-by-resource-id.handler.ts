import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetResourceItemsByResourceIdQuery } from '../get-resource-items-by-resource-id.query';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';

@QueryHandler(GetResourceItemsByResourceIdQuery)
export class GetResourceItemsByResourceIdHandler implements IQueryHandler<GetResourceItemsByResourceIdQuery> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(query: GetResourceItemsByResourceIdQuery): Promise<ResourceItemEntity[]> {
    const resourceId = UuidValueObject.fromString(query.resourceId);

    if (query.status && query.type) {
      return this.resourceItemRepository.findByResourceIdAndStatus(resourceId, query.status)
        .then(items => items.filter(item => item.type.value === query.type));
    } else if (query.status) {
      return this.resourceItemRepository.findByResourceIdAndStatus(resourceId, query.status);
    } else if (query.type) {
      return this.resourceItemRepository.findByResourceIdAndType(resourceId, query.type);
    } else if (query.isActive === true) {
      return this.resourceItemRepository.findAvailableByResourceId(resourceId);
    } else {
      return this.resourceItemRepository.findByResourceId(resourceId);
    }
  }
}
