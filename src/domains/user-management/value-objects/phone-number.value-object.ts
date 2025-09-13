// src/domains/user-management/value-objects/phone-number.value-object.ts
import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export class PhoneNumber extends ValueObjectBase<{ value: string }> {
  constructor(phone: string) {
    if (!PhoneNumber.isValidPhone(phone)) {
      throw new Error('Invalid phone number format');
    }
    
    super({ value: PhoneNumber.normalizePhone(phone) });
  }

  private static isValidPhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  private static normalizePhone(phone: string): string {
    return phone.replace(/[\s\-\(\)]/g, '');
  }

  get value(): string {
    return this.props.value;
  }

  get formatted(): string {
    const cleaned = this.value.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return this.value;
  }
}