// src/domains/user-management/entities/user.entity.ts
import { AggregateRoot } from '../../../shared/domain/base/aggregate-root.base';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { Email } from '../value-objects/email.value-object';
import { Name } from '../value-objects/name.value-objects';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRoleValue, UserRole } from '../value-objects/user-role.value-object';
import { UserRegistered } from '../events/user-registered.event';
import { UserEmailChanged } from '../events/user-email-changed.event';
import { UserDeactivated } from '../events/user-deactivated.events';

export interface UserProps {
  id: UuidValueObject;
  email: Email;
  name: Name;
  phone: PhoneNumber;
  role: UserRoleValue;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
}

export class User extends AggregateRoot<UserProps> {
  constructor(props: UserProps) {
    super(props);
    
    this.addDomainEvent(new UserRegistered(this.props.id.value, this.props.email.value));
  }

  static create(
    id: UuidValueObject,
    email: Email,
    name: Name,
    phone: PhoneNumber,
    role: UserRole = UserRole.CUSTOMER,
    avatarUrl?: string
  ): User {
    const props: UserProps = {
      id,
      email,
      name,
      phone,
      role: new UserRoleValue(role),
      isActive: true,
      avatarUrl,
      lastLoginAt: undefined
    };

    return new User(props);
  }

  changeEmail(newEmail: Email): void {
    if (this.props.email.equals(newEmail)) {
      return;
    }
    
    this.props.email = newEmail;
    this.addDomainEvent(new UserEmailChanged(this.props.id.value, newEmail.value));
  }

  updateName(newName: Name): void {
    this.props.name = newName;
  }

  updatePhone(newPhone: PhoneNumber): void {
    this.props.phone = newPhone;
  }

  updateAvatar(avatarUrl: string): void {
    this.props.avatarUrl = avatarUrl;
  }

  changeRole(newRole: UserRole): void {
    if (this.props.role.value === newRole) {
      return;
    }
    
    this.props.role = new UserRoleValue(newRole);
  }

  deactivate(): void {
    if (!this.props.isActive) {
      return;
    }
    
    this.props.isActive = false;
    this.addDomainEvent(new UserDeactivated(this.props.id.value));
  }

  activate(): void {
    if (this.props.isActive) {
      return;
    }
    
    this.props.isActive = true;
  }

  recordLogin(): void {
    this.props.lastLoginAt = new Date();
  }

  get id(): UuidValueObject {
    return this.props.id;
  }

  get email(): Email {
    return this.props.email;
  }

  get name(): Name {
    return this.props.name;
  }

  get phone(): PhoneNumber {
    return this.props.phone;
  }

  get role(): UserRoleValue {
    return this.props.role;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get avatarUrl(): string | undefined {
    return this.props.avatarUrl;
  }

  get lastLoginAt(): Date | undefined {
    return this.props.lastLoginAt;
  }
}