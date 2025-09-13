// src/domains/user-management/interfaces/user-repository.interface.ts
import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { User } from '../entites/user.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { Email } from '../value-objects/email.value-object';

export interface UserRepositoryInterface extends RepositoryInterface<User> {
  findByEmail(email: Email): Promise<User | null>;
  findByPhone(phone: string): Promise<User | null>;
  findActiveUsers(): Promise<User[]>;
  findUsersByRole(role: string): Promise<User[]>;
  existsByEmail(email: Email): Promise<boolean>;
  existsByPhone(phone: string): Promise<boolean>;
  searchByEmailPartial(emailPartial: string): Promise<User[]>;
  searchByNamePartial(namePartial: string): Promise<User[]>;
}