import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetResourceAvailabilityQuery } from '../get-resource-availability.query';
import { ResourceRepositoryInterface } from '../../interfaces/resource-repository.interface';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
export interface ResourceAvailabilityResult {
  resourceId: string;
  isAvailable: boolean;
  availableResources: any[];
  totalAvailable: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
}
@QueryHandler(GetResourceAvailabilityQuery)
export class GetResourceAvailabilityHandler implements IQueryHandler<GetResourceAvailabilityQuery> {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async execute(query: GetResourceAvailabilityQuery): Promise<ResourceAvailabilityResult> {
    const { resourceId, startDate, endDate } = query;

    const id = UuidValueObject.fromString(resourceId);
    
    const availability = await this.resourceRepository.checkAvailability(id, startDate, endDate);

    return {
      resourceId,
      isAvailable: availability.totalAvailable > 0,
      availableResources: availability.availableResources,
      totalAvailable: availability.totalAvailable,
      period: availability.period,
    };
  }
}
