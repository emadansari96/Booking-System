import { Email } from './email.value-object';

describe('Email', () => {
  describe('constructor', () => {
    it('should create a valid email', () => {
      const emailString = 'test@example.com';
      const email = new Email(emailString);
      
      expect(email.value).toBe(emailString);
    });

    it('should throw error for invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test.example.com',
        '',
        'test@.com',
        'test@example.',
      ];

      invalidEmails.forEach(invalidEmail => {
        expect(() => new Email(invalidEmail)).toThrow('Invalid email format');
      });
    });

    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'test+tag@example.org',
        'user123@test-domain.com',
      ];

      validEmails.forEach(validEmail => {
        expect(() => new Email(validEmail)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should return true for equal emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('other@example.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('domain', () => {
    it('should extract domain from email', () => {
      const email = new Email('test@example.com');
      
      expect(email.domain).toBe('example.com');
    });

    it('should extract domain from complex email', () => {
      const email = new Email('user.name@sub.domain.co.uk');
      
      expect(email.domain).toBe('sub.domain.co.uk');
    });
  });

  describe('localPart', () => {
    it('should extract local part from email', () => {
      const email = new Email('test@example.com');
      
      expect(email.localPart).toBe('test');
    });

    it('should extract local part from complex email', () => {
      const email = new Email('user.name+tag@example.com');
      
      expect(email.localPart).toBe('user.name+tag');
    });
  });
});