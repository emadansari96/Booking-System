export interface RepositoryInterface<T> {
  save(entity: T): Promise<T>;
  findById(id: any): Promise<T | null>;
  findAll(): Promise<T[]>;
  delete(id: any): Promise<void>;
}