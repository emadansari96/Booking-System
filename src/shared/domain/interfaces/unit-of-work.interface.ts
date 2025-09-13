// src/shared/domain/interfaces/unit-of-work.interface.ts
export interface UnitOfWork {
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
    isActive(): boolean;
  }