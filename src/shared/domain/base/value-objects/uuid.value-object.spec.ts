import { UuidValueObject } from './uuid.value-object';

describe('UuidValueObject', () => {
  describe('constructor', () => {
    it('should create a valid UUID value object', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      const uuidValueObject = new UuidValueObject({ value: uuid });
      
      expect(uuidValueObject.value).toBe(uuid);
    });
  });

  describe('generate', () => {
    it('should generate a UUID instance', () => {
      const uuid = UuidValueObject.generate();
      
      expect(uuid).toBeInstanceOf(UuidValueObject);
    });
  });

  describe('fromString', () => {
    it('should create UUID from valid string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const uuid = UuidValueObject.fromString(uuidString);
      
      expect(uuid.value).toBe(uuidString);
    });

    it('should throw error for invalid string', () => {
      expect(() => UuidValueObject.fromString('invalid')).toThrow('Invalid UUID format');
    });
  });

  describe('equals', () => {
    it('should return true for equal UUIDs', () => {
      const uuid1 = new UuidValueObject({ value: '550e8400-e29b-41d4-a716-446655440000' });
      const uuid2 = new UuidValueObject({ value: '550e8400-e29b-41d4-a716-446655440000' });
      
      expect(uuid1.equals(uuid2)).toBe(true);
    });

    it('should return false for different UUIDs', () => {
      const uuid1 = new UuidValueObject({ value: '550e8400-e29b-41d4-a716-446655440000' });
      const uuid2 = new UuidValueObject({ value: '550e8400-e29b-41d4-a716-446655440001' });
      
      expect(uuid1.equals(uuid2)).toBe(false);
    });
  });
});