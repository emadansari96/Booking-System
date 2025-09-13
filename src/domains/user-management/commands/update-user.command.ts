import { IsEmail, IsString, IsOptional, IsPhoneNumber } from 'class-validator';

export class UpdateUserCommand {
  @IsString()
  id: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  constructor(data: {
    id: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatarUrl?: string;
  }) {
    this.id = data.id;
    this.email = data.email;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.phone = data.phone;
    this.avatarUrl = data.avatarUrl;
  }
}
