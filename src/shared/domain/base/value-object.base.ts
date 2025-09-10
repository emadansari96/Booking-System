// src/shared/domain/base/value-object.base.ts
export abstract class ValueObject<T> {
    protected readonly _value: T;
  
    constructor(value: T) {
      this._value = value;
    }
  
    get value(): T {
      return this._value;
    }
  
    equals(vo?: ValueObject<T>): boolean {
      if (vo === null || vo === undefined) {
        return false;
      }
      if (this === vo) {
        return true;
      }
      return JSON.stringify(this._value) === JSON.stringify(vo._value);
    }
  }