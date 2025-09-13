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
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Check if it starts with + and has 10-15 digits after it
    if (cleaned.startsWith('+')) {
      const digits = cleaned.slice(1);
      return /^[1-9]\d{9,14}$/.test(digits);
    }
    
    // Check Iranian phone numbers (09xxxxxxxxx or 9xxxxxxxxx)
    if (/^09\d{9}$/.test(cleaned)) {
      return true; // 09xxxxxxxxx format
    }
    
    if (/^9\d{9}$/.test(cleaned)) {
      return true; // 9xxxxxxxxx format
    }
    
    // Check if it's a 10-digit number starting with 1-9 (international format)
    return /^[1-9]\d{9}$/.test(cleaned);
  }

  private static normalizePhone(phone: string): string {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    // Convert Iranian phone numbers to international format
    if (/^09\d{9}$/.test(cleaned)) {
      return '+98' + cleaned.slice(1); // 09xxxxxxxxx -> +98xxxxxxxxx
    }
    
    if (/^9\d{9}$/.test(cleaned)) {
      return '+98' + cleaned; // 9xxxxxxxxx -> +98xxxxxxxxx
    }
    
    return cleaned;
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