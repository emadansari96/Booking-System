import { DomainEvent } from '../events/domain-event.base';

export abstract class AggregateRoot<T> {
  protected readonly props: T;
  private _domainEvents: DomainEvent[] = [];

  constructor(props: T) {
    this.props = props;
  }

  get domainEvents(): DomainEvent[] {
    return this._domainEvents;
  }

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  public clearEvents(): void {
    this._domainEvents = [];
  }

  public markEventsAsDispatched(): void {
    this.clearEvents();
  }
}