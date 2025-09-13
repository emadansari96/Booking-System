import { IsEmail, IsString, IsEnum, IsOptional, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../dtos/user-role.dto';

export class CreateUserCommand {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsPhoneNumber()
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  constructor(data: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRole;
    avatarUrl?: string;
  }) {
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone;
    this.role = data.role;
    this.avatarUrl = data.avatarUrl;
  }
}
