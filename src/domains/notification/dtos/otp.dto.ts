import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsUUID } from 'class-validator';

export class CreateOtpDto {
  @IsUUID()
  userId: string;

  @IsString()
  email: string;

  @IsEnum(['registration', 'login', 'password-reset'])
  type: string;

  @IsOptional()
  @IsNumber()
  expiresInMinutes?: number;

  @IsOptional()
  @IsNumber()
  maxAttempts?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class VerifyOtpDto {
  @IsUUID()
  userId: string;

  @IsString()
  email: string;

  @IsString()
  code: string;

  @IsEnum(['registration', 'login', 'password-reset'])
  type: string;
}

export class OtpResponseDto {
  id: string;
  userId: string;
  email: string;
  type: string;
  status: string;
  expiresAt: Date;
  verifiedAt?: Date;
  usedAt?: Date;
  attempts: number;
  maxAttempts: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class OtpStatisticsDto {
  totalOtps: number;
  pendingOtps: number;
  verifiedOtps: number;
  expiredOtps: number;
  usedOtps: number;
  successRate: number;
}

export class GetOtpsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(['REGISTRATION', 'LOGIN', 'PASSWORD_RESET'])
  type?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'VERIFIED', 'EXPIRED', 'USED'])
  status?: string;

  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsEnum(['createdAt', 'expiresAt', 'type'])
  sortBy?: string;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: string;
}
