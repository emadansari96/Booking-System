import { Injectable, Inject } from '@nestjs/common';
import { ResourceRepositoryInterface } from '../interfaces/resource-repository.interface';
import { ResourceName } from '../value-objects/resource-name.value-object';

@Injectable()
export class ResourceDomainService {
  constructor(
    @Inject('ResourceRepositoryInterface')
    private readonly resourceRepository: ResourceRepositoryInterface,
  ) {}

  async ensureResourceNameIsUnique(name: ResourceName, excludeId?: string): Promise<void> {
    const existingResource = await this.resourceRepository.findByName(name.value);
    
    if (existingResource && (!excludeId || existingResource.id.value !== excludeId)) {
      throw new Error(`Resource with name "${name.value}" already exists`);
    }
  }

  async validateResourceCapacity(capacity: number): Promise<void> {
    if (capacity <= 0) {
      throw new Error('Resource capacity must be greater than 0');
    }

    if (capacity > 1000) {
      throw new Error('Resource capacity cannot exceed 1000');
    }
  }

  async validateResourcePrice(price: number): Promise<void> {
    if (price < 0) {
      throw new Error('Resource price cannot be negative');
    }

    if (price > 1000000) {
      throw new Error('Resource price cannot exceed 1,000,000');
    }
  }

  async validateResourceStatusTransition(
    currentStatus: string,
    newStatus: string
  ): Promise<void> {
    const validTransitions: Record<string, string[]> = {
      'AVAILABLE': ['BOOKED', 'MAINTENANCE', 'UNAVAILABLE'],
      'BOOKED': ['AVAILABLE', 'MAINTENANCE'],
      'MAINTENANCE': ['AVAILABLE', 'UNAVAILABLE'],
      'UNAVAILABLE': ['AVAILABLE', 'MAINTENANCE'],
    };

    const allowedStatuses = validTransitions[currentStatus];
    if (!allowedStatuses || !allowedStatuses.includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }

  async calculateResourceUtilization(resourceId: string): Promise<number> {
    // This would typically query booking data to calculate utilization
    // For now, return a placeholder
    return 0;
  }

  async getResourceRecommendations(
    type: string,
    capacity: number,
    price: number
  ): Promise<string[]> {
    // This would implement recommendation logic
    // For now, return empty array
    return [];
  }
}
