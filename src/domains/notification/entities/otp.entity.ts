import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { OtpCode } from '../value-objects/otp-code.value-object';
import { OtpType, OtpTypeEnum } from '../value-objects/otp-type.value-object';
import { OtpStatus, OtpStatusEnum } from '../value-objects/otp-status.value-object';
import { OtpCreatedEvent } from '../events/otp-created.event';
import { OtpVerifiedEvent } from '../events/otp-verified.event';
import { OtpExpiredEvent } from '../events/otp-expired.event';
import { OtpUsedEvent } from '../events/otp-used.event';
export interface OtpProps {
  id: UuidValueObject;
  userId: UuidValueObject;
  email: string;
  code: OtpCode;
  type: OtpType;
  status: OtpStatus;
  expiresAt: Date;
  verifiedAt?: Date;
  usedAt?: Date;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class OtpEntity extends AggregateRoot<OtpProps> {
  private constructor(props: OtpProps) {
    super(props);
  }

  public static create(
    id: UuidValueObject,
    userId: UuidValueObject,
    email: string,
    type: string,
    expiresInMinutes: number = 10,
    maxAttempts: number = 3,
    metadata?: Record<string, any>
  ): OtpEntity {
    const otp = new OtpEntity({
      id,
      userId,
      email,
      code: OtpCode.generate(),
      type: OtpType.create(type as any),
      status: OtpStatus.create(OtpStatusEnum.PENDING),
      expiresAt: new Date(Date.now() + expiresInMinutes * 60 * 1000),
      attempts: 0,
      maxAttempts,
      metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    otp.addDomainEvent(new OtpCreatedEvent(
      otp.props.id.value,
      otp.props.userId.value,
      otp.props.email,
      otp.props.code.value,
      otp.props.type.value,
      otp.props.expiresAt,
    ));

    return otp;
  }

  public static fromPersistence(props: OtpProps): OtpEntity {
    return new OtpEntity(props);
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get userId(): UuidValueObject {
    return this.props.userId;
  }

  get email(): string {
    return this.props.email;
  }

  get code(): OtpCode {
    return this.props.code;
  }

  get type(): OtpType {
    return this.props.type;
  }

  get status(): OtpStatus {
    return this.props.status;
  }

  get expiresAt(): Date {
    return this.props.expiresAt;
  }

  get verifiedAt(): Date | undefined {
    return this.props.verifiedAt;
  }

  get usedAt(): Date | undefined {
    return this.props.usedAt;
  }

  get attempts(): number {
    return this.props.attempts;
  }

  get maxAttempts(): number {
    return this.props.maxAttempts;
  }

  get metadata(): Record<string, any> | undefined {
    return this.props.metadata;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  public verify(inputCode: string): boolean {
    if (!this.props.status.canTransitionTo(OtpStatusEnum.VERIFIED)) {
      throw new Error(`Cannot verify OTP with status: ${this.props.status.value}`);
    }

    if (this.isExpired()) {
      this.markAsExpired();
      return false;
    }

    if (this.props.attempts >= this.props.maxAttempts) {
      this.markAsExpired();
      return false;
    }

    this.props.attempts += 1;

    if (this.props.code.value === inputCode) {
      this.props.status = OtpStatus.create(OtpStatusEnum.VERIFIED);
      this.props.verifiedAt = new Date();
      this.props.updatedAt = new Date();

      this.addDomainEvent(new OtpVerifiedEvent(
        this.props.id.value,
        this.props.userId.value,
        this.props.email,
        this.props.type.value,
      ));

      return true;
    }

    this.props.updatedAt = new Date();
    return false;
  }

  public markAsUsed(): void {
    if (!this.props.status.canTransitionTo(OtpStatusEnum.USED)) {
      throw new Error(`Cannot mark OTP as used with status: ${this.props.status.value}`);
    }

    this.props.status = OtpStatus.create(OtpStatusEnum.USED);
    this.props.usedAt = new Date();
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OtpUsedEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.email,
      this.props.type.value,
    ));
  }

  public markAsExpired(): void {
    if (!this.props.status.canTransitionTo(OtpStatusEnum.EXPIRED)) {
      throw new Error(`Cannot mark OTP as expired with status: ${this.props.status.value}`);
    }

    this.props.status = OtpStatus.create(OtpStatusEnum.EXPIRED);
    this.props.updatedAt = new Date();

    this.addDomainEvent(new OtpExpiredEvent(
      this.props.id.value,
      this.props.userId.value,
      this.props.email,
      this.props.type.value,
    ));
  }

  public isExpired(): boolean {
    return new Date() > this.props.expiresAt;
  }

  public isValid(): boolean {
    return this.props.status.isPending() && !this.isExpired() && this.props.attempts < this.props.maxAttempts;
  }

  public canVerify(): boolean {
    return this.isValid();
  }

  public getRemainingAttempts(): number {
    return Math.max(0, this.props.maxAttempts - this.props.attempts);
  }

  public getTimeUntilExpiry(): number {
    const now = new Date();
    const expiry = this.props.expiresAt;
    return Math.max(0, expiry.getTime() - now.getTime());
  }

  public isPending(): boolean {
    return this.props.status.isPending();
  }

  public isVerified(): boolean {
    return this.props.status.isVerified();
  }

  public isUsed(): boolean {
    return this.props.status.isUsed();
  }
}
