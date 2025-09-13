// src/domains/user-management/value-objects/email.value-object.ts
import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export class Email extends ValueObjectBase<{ value: string }> {
  constructor(email: string) {
    if (!Email.isValidEmail(email)) {
      throw new Error('Invalid email format');
    }
    
    super({ value: email.toLowerCase().trim() });
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this.props.value;
  }

  get domain(): string {
    return this.value.split('@')[1];
  }

  get localPart(): string {
    return this.value.split('@')[0];
  }
}