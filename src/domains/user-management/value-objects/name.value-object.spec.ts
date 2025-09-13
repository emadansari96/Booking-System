import { Name } from './name.value-objects';

describe('Name', () => {
  describe('constructor', () => {
    it('should create a valid name', () => {
      const name = new Name('John', 'Doe');
      
      expect(name.value.firstName).toBe('John');
      expect(name.value.lastName).toBe('Doe');
    });

    it('should throw error for empty first name', () => {
      expect(() => new Name('', 'Doe')).toThrow('First name and last name are required');
    });

    it('should throw error for empty last name', () => {
      expect(() => new Name('John', '')).toThrow('First name and last name are required');
    });

    it('should throw error for name too short', () => {
      expect(() => new Name('A', 'Doe')).toThrow('Name must be at least 2 characters long');
    });

    it('should accept valid names', () => {
      const validNames = [
        ['John', 'Doe'],
        ['Mary', 'Jane'],
        ['José', 'María'],
        ['Jean', 'Pierre'],
      ];

      validNames.forEach(([firstName, lastName]) => {
        expect(() => new Name(firstName, lastName)).not.toThrow();
      });
    });
  });

  describe('equals', () => {
    it('should return true for equal names', () => {
      const name1 = new Name('John', 'Doe');
      const name2 = new Name('John', 'Doe');
      
      expect(name1.equals(name2)).toBe(true);
    });

    it('should return false for different names', () => {
      const name1 = new Name('John', 'Doe');
      const name2 = new Name('Jane', 'Doe');
      
      expect(name1.equals(name2)).toBe(false);
    });
  });

  describe('fullName', () => {
    it('should return full name', () => {
      const name = new Name('John', 'Doe');
      
      expect(name.fullName).toBe('John Doe');
    });
  });
});