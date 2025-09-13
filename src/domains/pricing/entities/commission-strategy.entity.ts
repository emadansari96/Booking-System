import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { CommissionName } from '../value-objects/commission-name.value-object';
import { CommissionType } from '../value-objects/commission-type.value-object';
import { CommissionValue } from '../value-objects/commission-value.value-object';
import { CommissionStrategyCreatedEvent } from '../events/commission-strategy-created.event';
import { CommissionStrategyUpdatedEvent } from '../events/commission-strategy-updated.event';
import { CommissionStrategyActivatedEvent } from '../events/commission-strategy-activated.event';
import { CommissionStrategyDeactivatedEvent } from '../events/commission-strategy-deactivated.event';

export interface CommissionStrategyProps {
  id: UuidValueObject;
  name: CommissionName;
  type: CommissionType;
  value: CommissionValue;
  description?: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  applicableResourceTypes?: string[]; // Which resource types this applies to
  minBookingDuration?: number; // Minimum booking duration in hours
  maxBookingDuration?: number; // Maximum booking duration in hours
  createdAt: Date;
  updatedAt: Date;
}

export class CommissionStrategyEntity extends AggregateRoot<CommissionStrategyProps> {
  private constructor(props: CommissionStrategyProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    name: string,
    type: string,
    value: number,
    description?: string,
    priority: number = 1,
    applicableResourceTypes?: string[],
    minBookingDuration?: number,
    maxBookingDuration?: number
  ): CommissionStrategyEntity {
    const strategy = new CommissionStrategyEntity({
      id,
      name: CommissionName.create(name),
      type: CommissionType.create(type as any),
      value: CommissionValue.create(value),
      description,
      isActive: true,
      priority,
      applicableResourceTypes: applicableResourceTypes || [],
      minBookingDuration,
      maxBookingDuration,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    strategy.addDomainEvent(new CommissionStrategyCreatedEvent(
      strategy.props.id.value,
      strategy.props.name.value,
      strategy.props.type.value,
      strategy.props.value.value,
    ));

    return strategy;
  }

  public static fromPersistence(props: CommissionStrategyProps): CommissionStrategyEntity {
    return new CommissionStrategyEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get name(): CommissionName {
    return this.props.name;
  }

  get type(): CommissionType {
    return this.props.type;
  }

  get value(): CommissionValue {
    return this.props.value;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get priority(): number {
    return this.props.priority;
  }

  get applicableResourceTypes(): string[] {
    return this.props.applicableResourceTypes || [];
  }

  get minBookingDuration(): number | undefined {
    return this.props.minBookingDuration;
  }

  get maxBookingDuration(): number | undefined {
    return this.props.maxBookingDuration;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public updateDetails(
    name?: string,
    description?: string,
    priority?: number,
    applicableResourceTypes?: string[],
    minBookingDuration?: number,
    maxBookingDuration?: number
  ): void {
    if (name !== undefined) {
      this.props.name = CommissionName.create(name);
    }
    if (description !== undefined) {
      this.props.description = description;
    }
    if (priority !== undefined) {
      this.props.priority = priority;
    }
    if (applicableResourceTypes !== undefined) {
      this.props.applicableResourceTypes = applicableResourceTypes;
    }
    if (minBookingDuration !== undefined) {
      this.props.minBookingDuration = minBookingDuration;
    }
    if (maxBookingDuration !== undefined) {
      this.props.maxBookingDuration = maxBookingDuration;
    }

    this.props.updatedAt = new Date();

    this.addDomainEvent(new CommissionStrategyUpdatedEvent(
      this.props.id.value,
      this.props.name.value,
      this.props.type.value,
      this.props.value.value,
    ));
  }

  public updateCommission(type: string, value: number): void {
    this.props.type = CommissionType.create(type as any);
    this.props.value = CommissionValue.create(value);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CommissionStrategyUpdatedEvent(
      this.props.id.value,
      this.props.name.value,
      this.props.type.value,
      this.props.value.value,
    ));
  }

  public activate(): void {
    if (this.props.isActive) {
      throw new Error('Commission strategy is already active');
    }

    this.props.isActive = true;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CommissionStrategyActivatedEvent(
      this.props.id.value,
      this.props.name.value,
    ));
  }

  public deactivate(): void {
    if (!this.props.isActive) {
      throw new Error('Commission strategy is already inactive');
    }

    this.props.isActive = false;
    this.props.updatedAt = new Date();

    this.addDomainEvent(new CommissionStrategyDeactivatedEvent(
      this.props.id.value,
      this.props.name.value,
    ));
  }

  public calculateCommission(baseAmount: number, bookingDurationHours: number, resourceType: string): number {
    // Check if this strategy applies to the resource type
    if (this.props.applicableResourceTypes.length > 0 && 
        !this.props.applicableResourceTypes.includes(resourceType)) {
      return 0;
    }

    // Check booking duration constraints
    if (this.props.minBookingDuration && bookingDurationHours < this.props.minBookingDuration) {
      return 0;
    }

    if (this.props.maxBookingDuration && bookingDurationHours > this.props.maxBookingDuration) {
      return 0;
    }

    return this.props.value.calculateCommission(baseAmount, this.props.type.value);
  }

  public isApplicable(resourceType: string, bookingDurationHours: number): boolean {
    // Check resource type
    if (this.props.applicableResourceTypes.length > 0 && 
        !this.props.applicableResourceTypes.includes(resourceType)) {
      return false;
    }

    // Check booking duration
    if (this.props.minBookingDuration && bookingDurationHours < this.props.minBookingDuration) {
      return false;
    }

    if (this.props.maxBookingDuration && bookingDurationHours > this.props.maxBookingDuration) {
      return false;
    }

    return true;
  }
}
