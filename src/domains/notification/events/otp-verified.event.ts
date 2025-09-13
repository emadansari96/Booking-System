import { DomainEvent } from '../../../shared/domain/events/domain-event.base';

export class OtpVerifiedEvent extends DomainEvent {
  public readonly eventName: string = 'OtpVerified';
  public readonly occurredOn: Date;
  public readonly aggregateId: string;
  public readonly eventVersion: number = 1;

  constructor(
    public readonly otpId: string,
    public readonly userId: string,
    public readonly email: string,
    public readonly type: string,
    occurredOn: Date = new Date()
  ) {
    super();
    this.occurredOn = occurredOn;
    this.aggregateId = otpId;
  }
}
