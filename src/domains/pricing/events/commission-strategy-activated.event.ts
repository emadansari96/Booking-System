import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class CommissionStrategyActivatedEvent extends DomainEvent {
  public readonly eventName: string = 'CommissionStrategyActivated';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly commissionStrategyId: string,
    public readonly name: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = commissionStrategyId;
  }
}
