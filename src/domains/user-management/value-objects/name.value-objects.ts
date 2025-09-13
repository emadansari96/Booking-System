// src/domains/user-management/value-objects/name.value-object.ts
import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export class Name extends ValueObjectBase<{ firstName: string; lastName: string }> {
  constructor(firstName: string, lastName: string) {
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }
    
    if (firstName.length < 2 || lastName.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }
    
    super({
      firstName: firstName.trim(),
      lastName: lastName.trim()
    });
  }

  get value(): { firstName: string; lastName: string } {
    return this.props;
  }

  get fullName(): string {
    return `${this.value.firstName} ${this.value.lastName}`;
  }

  get firstName(): string {
    return this.value.firstName;
  }

  get lastName(): string {
    return this.value.lastName;
  }
}