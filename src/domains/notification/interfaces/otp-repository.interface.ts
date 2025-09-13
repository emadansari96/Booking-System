import { RepositoryInterface } from '../../../shared/domain/interfaces/repository.interface';
import { OtpEntity } from '../entities/otp.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';

export interface OtpSearchCriteria {
  userId?: UuidValueObject;
  email?: string;
  type?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'expiresAt' | 'type';
  sortOrder?: 'ASC' | 'DESC';
}

export interface OtpSearchResult {
  otps: OtpEntity[];
  total: number;
  page: number;
  limit: number;
}

export interface OtpRepositoryInterface extends RepositoryInterface<OtpEntity> {
  findById(id: UuidValueObject): Promise<OtpEntity | null>;
  findByUserId(userId: UuidValueObject): Promise<OtpEntity[]>;
  findByEmail(email: string): Promise<OtpEntity[]>;
  findByType(type: string): Promise<OtpEntity[]>;
  findByStatus(status: string): Promise<OtpEntity[]>;
  findByDateRange(startDate?: Date, endDate?: Date): Promise<OtpEntity[]>;
  findValidOtpByUserAndType(userId: UuidValueObject, email: string, type: string): Promise<OtpEntity | null>;
  findExpiredOtps(): Promise<OtpEntity[]>;
  findPendingOtps(): Promise<OtpEntity[]>;
  findVerifiedOtps(): Promise<OtpEntity[]>;
  findUsedOtps(): Promise<OtpEntity[]>;
  search(criteria: OtpSearchCriteria): Promise<OtpSearchResult>;
  findByUserAndEmail(userId: UuidValueObject, email: string): Promise<OtpEntity[]>;
  findRecentOtpsByUser(userId: UuidValueObject, limit: number): Promise<OtpEntity[]>;
}
