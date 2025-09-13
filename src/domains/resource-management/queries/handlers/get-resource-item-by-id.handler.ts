import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetResourceItemByIdQuery } from '../get-resource-item-by-id.query';
import { ResourceItemEntity } from '../../entities/resource-item.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { ResourceItemRepositoryInterface } from '../../interfaces/resource-item-repository.interface';
import { Inject } from '@nestjs/common';
@QueryHandler(GetResourceItemByIdQuery)
export class GetResourceItemByIdHandler implements IQueryHandler<GetResourceItemByIdQuery> {
  constructor(
    @Inject('ResourceItemRepositoryInterface')
    private readonly resourceItemRepository: ResourceItemRepositoryInterface,
  ) {}

  async execute(query: GetResourceItemByIdQuery): Promise<ResourceItemEntity | null> {
    return this.resourceItemRepository.findById(UuidValueObject.fromString(query.id));
  }
}
