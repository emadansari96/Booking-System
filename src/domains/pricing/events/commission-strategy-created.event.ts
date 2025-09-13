import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class CommissionStrategyCreatedEvent extends DomainEvent {
  public readonly eventName: string = 'CommissionStrategyCreated';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly commissionStrategyId: string,
    public readonly name: string,
    public readonly type: string,
    public readonly value: number,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = commissionStrategyId;
  }
}
