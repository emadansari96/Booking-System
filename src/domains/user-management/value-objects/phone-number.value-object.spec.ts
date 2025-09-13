import { PhoneNumber } from './phone-number.value-object';

describe('PhoneNumber', () => {
  describe('constructor', () => {
    it('should create a valid phone number', () => {
      const phoneString = '+1234567890';
      const phone = new PhoneNumber(phoneString);
      
      expect(phone.value).toBe(phoneString);
    });

    it('should throw error for invalid phone number format', () => {
      const invalidPhones = [
        'invalid-phone',
        '123',
        '+123',
        '12345678901234567890', // too long
        '',
        'abc-def-ghij',
      ];

      invalidPhones.forEach(invalidPhone => {
        expect(() => new PhoneNumber(invalidPhone)).toThrow('Invalid phone number format');
      });
    });

    it('should accept valid phone number formats', () => {
      const validPhones = [
        '+1234567890',
        '+1-234-567-8900',
        '+1 (234) 567-8900',
        '+98 912 345 6789',
        '+44 20 7946 0958',
        '1234567890',
        '(123) 456-7890',
        '123-456-7890',
      ];

      validPhones.forEach(validPhone => {
        expect(() => new PhoneNumber(validPhone)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should return true for equal phone numbers', () => {
      const phone1 = new PhoneNumber('+1234567890');
      const phone2 = new PhoneNumber('+1234567890');
      
      expect(phone1.equals(phone2)).toBe(true);
    });

    it('should return false for different phone numbers', () => {
      const phone1 = new PhoneNumber('+1234567890');
      const phone2 = new PhoneNumber('+1234567891');
      
      expect(phone1.equals(phone2)).toBe(false);
    });
  });
});