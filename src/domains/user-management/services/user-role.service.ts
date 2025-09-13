// src/domains/user-management/services/user-role.service.ts
import { Injectable } from '@nestjs/common';
import { UserRole, UserRoleResponseDto } from '../dtos/user-role.dto';
@Injectable()
export class UserRoleService {
  
  getAllRoles(): UserRoleResponseDto[] {
    return Object.values(UserRole).map(role => new UserRoleResponseDto(role));
  }

  getRoleInfo(role: UserRole): UserRoleResponseDto {
    return new UserRoleResponseDto(role);
  }

  canChangeRole(fromRole: UserRole, toRole: UserRole): boolean {
    // ✅ Business rules for role changes
    if (fromRole === UserRole.ADMIN) {
      return true; // Admin can change to any role
    }
    
    if (fromRole === UserRole.MANAGER) {
      return toRole === UserRole.CUSTOMER; // Manager can only demote to customer
    }
    
    if (fromRole === UserRole.CUSTOMER) {
      return false; // Customer cannot change roles
    }
    
    return false;
  }

  hasPermission(role: UserRole, permission: string): boolean {
    const roleInfo = this.getRoleInfo(role);
    return roleInfo.permissions.includes(permission);
  }

  getRoleHierarchy(): { [key in UserRole]: number } {
    return {
      [UserRole.CUSTOMER]: 1,
      [UserRole.MANAGER]: 2,
      [UserRole.ADMIN]: 3
    };
  }

  isHigherRole(role1: UserRole, role2: UserRole): boolean {
    const hierarchy = this.getRoleHierarchy();
    return hierarchy[role1] > hierarchy[role2];
  }
}