import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetResourceByIdQuery } from '../get-resource-by-id.query';
import { ResourceEntity } from '../../entities/resource.entity';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';

@QueryHandler(GetResourceByIdQuery)
export class GetResourceByIdHandler implements IQueryHandler<GetResourceByIdQuery> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(query: GetResourceByIdQuery): Promise<ResourceEntity | null> {
    const { id } = query;

    const resourceId = UuidValueObject.fromString(id);
    const resource = await this.resourceRepository.findById(resourceId);

    return resource;
  }
}
