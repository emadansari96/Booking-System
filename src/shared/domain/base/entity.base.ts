// src/shared/domain/base/entity.base.ts
export abstract class Entity<T> {
    protected readonly _id: T;
    protected _createdAt: Date;
    protected _updatedAt: Date;
  
    constructor(id: T, createdAt?: Date, updatedAt?: Date) {
      this._id = id;
      this._createdAt = createdAt || new Date();
      this._updatedAt = updatedAt || new Date();
    }
  
    get id(): T {
      return this._id;
    }
  
    get createdAt(): Date {
      return this._createdAt;
    }
  
    get updatedAt(): Date {
      return this._updatedAt;
    }
  
    protected markUpdated(): void {
      this._updatedAt = new Date();
    }
  
    equals(entity?: Entity<T>): boolean {
      if (entity === null || entity === undefined) {
        return false;
      }
  
      if (this === entity) {
        return true;
      }
  
      return this._id === entity._id;
    }
  }