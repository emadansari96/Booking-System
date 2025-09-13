// src/domains/user-management/dtos/user-role.dto.ts
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  MANAGER = 'manager'
}

export class UserRoleDto {
  @IsNotEmpty({ message: 'User role is required' })
  @IsEnum(UserRole, { message: 'Invalid user role. Must be one of: customer, admin, manager' })
  role: UserRole;

  constructor(role: UserRole) {
    this.role = role;
  }
}

export class ChangeUserRoleDto {
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
@IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Invalid user role. Must be one of: customer, admin, manager' })
  role: UserRole;
}

export class UserRoleResponseDto {
  role: UserRole;
  displayName: string;
  permissions: string[];

  constructor(role: UserRole) {
    this.role = role;
    this.displayName = this.getDisplayName(role);
    this.permissions = this.getPermissions(role);
  }

  private getDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.CUSTOMER:
        return 'Customer';
      case UserRole.ADMIN:
        return 'Administrator';
      case UserRole.MANAGER:
        return 'Manager';
      default:
        return 'Unknown';
    }
  }

  private getPermissions(role: UserRole): string[] {
    switch (role) {
      case UserRole.ADMIN:
        return [
          'user.create',
          'user.read',
          'user.update',
          'user.delete',
          'booking.create',
          'booking.read',
          'booking.update',
          'booking.delete',
          'resource.create',
          'resource.read',
          'resource.update',
          'resource.delete',
          'system.config'
        ];
      case UserRole.MANAGER:
        return [
          'user.create',
          'user.read',
          'user.update',
          'booking.create',
          'booking.read',
          'booking.update',
          'resource.create',
          'resource.read',
          'resource.update'
        ];
      case UserRole.CUSTOMER:
        return [
          'user.read',
          'user.update',
          'booking.create',
          'booking.read',
          'booking.update',
          'resource.read'
        ];
      default:
        return [];
    }
  }
}

export class UserRoleValidationDto {
  @IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  currentRole?: UserRole;
@IsNotEmpty({ message: 'Target role is required' })
  @IsEnum(UserRole, { message: 'Invalid target role' })
  targetRole: UserRole;
@IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}