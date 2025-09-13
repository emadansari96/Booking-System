// src/domains/user-management/dtos/user.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { UserRole } from './user-role.dto';
export class CreateUserDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
@IsNotEmpty({ message: 'First name is required' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;
@IsNotEmpty({ message: 'Last name is required' })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;
@IsNotEmpty({ message: 'Phone number is required' })
  @IsString({ message: 'Phone number must be a string' })
  phone: string;
@IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  password: string;
@IsOptional()
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role?: UserRole;
@IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatarUrl?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;
@IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName?: string;
@IsOptional()
  @IsString({ message: 'Last name must be a string' })
  lastName?: string;
@IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  phone?: string;
@IsOptional()
  @IsString({ message: 'Avatar URL must be a string' })
  avatarUrl?: string;
}

export class ChangeUserRoleDto {
  @IsNotEmpty({ message: 'User ID is required' })
  @IsUUID('4', { message: 'Invalid user ID format' })
  userId: string;
@IsNotEmpty({ message: 'Role is required' })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role: UserRole;
}

export class UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}