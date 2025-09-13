import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { CommissionStrategyEntity } from '../entities/commission-strategy.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface CommissionStrategySearchCriteria {
  name?: string;
  type?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  isActive?: boolean;
  priority?: number;
  applicableResourceTypes?: string[];
  minValue?: number;
  maxValue?: number;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'priority' | 'value' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface CommissionStrategySearchResult {
  strategies: CommissionStrategyEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface CommissionStrategyRepositoryInterface extends RepositoryInterface<CommissionStrategyEntity> {
  findById(id: UuidValueObject): Promise<CommissionStrategyEntity | null>;
  findByName(name: string): Promise<CommissionStrategyEntity | null>;
  findActiveStrategies(): Promise<CommissionStrategyEntity[]>;
  findStrategiesByType(type: string): Promise<CommissionStrategyEntity[]>;
  findStrategiesByResourceType(resourceType: string): Promise<CommissionStrategyEntity[]>;
  findStrategiesByPriority(priority: number): Promise<CommissionStrategyEntity[]>;
  findHighestPriorityStrategy(resourceType: string, bookingDurationHours: number): Promise<CommissionStrategyEntity | null>;
  search(criteria: CommissionStrategySearchCriteria): Promise<CommissionStrategySearchResult>;
  findByValueRange(minValue: number, maxValue: number): Promise<CommissionStrategyEntity[]>;
  findStrategiesByBookingDuration(bookingDurationHours: number): Promise<CommissionStrategyEntity[]>;
}
