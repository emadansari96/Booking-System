// src/domains/user-management/value-objects/user-role.value-object.ts
import { ValueObjectBase } from '../../../shared/domain/base/value-objects/value-object.base';

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export class UserRoleValue extends ValueObjectBase<{ value: UserRole }> {
  constructor(role: UserRole) {
    if (!Object.values(UserRole).includes(role)) {
      throw new Error('Invalid user role');
    }
    
    super({ value: role });
  }

  get value(): UserRole {
    return this.props.value;
  }

  isAdmin(): boolean {
    return this.value === UserRole.ADMIN;
  }

  isManager(): boolean {
    return this.value === UserRole.MANAGER;
  }

  isCustomer(): boolean {
    return this.value === UserRole.CUSTOMER;
  }

  canManageUsers(): boolean {
    return this.isAdmin() || this.isManager();
  }
}