import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OtpRepositoryInterface, OtpSearchCriteria, OtpSearchResult } from '../../../../domains/notification/interfaces/otp-repository.interface';
import { OtpEntity } from '../../../../domains/notification/entities/otp.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { OtpCode } from '../../../../domains/notification/value-objects/otp-code.value-object';
import { OtpType, OtpTypeEnum } from '../../../../domains/notification/value-objects/otp-type.value-object';
import { OtpStatus, OtpStatusEnum } from '../../../../domains/notification/value-objects/otp-status.value-object';
import { 
  OtpType as PrismaOtpType,
  OtpStatus as PrismaOtpStatus
} from '@prisma/client';

@Injectable()
export class PrismaOtpRepository implements OtpRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(entity: OtpEntity): Promise<OtpEntity> {
    const data = {
      id: entity.id.value,
      userId: entity.userId.value,
      email: entity.email,
      code: entity.code.value,
      type: entity.type.value as any,
      status: entity.status.value as any,
      expiresAt: entity.expiresAt,
      verifiedAt: entity.verifiedAt,
      usedAt: entity.usedAt,
      attempts: entity.attempts,
      maxAttempts: entity.maxAttempts,
      metadata: entity.metadata,
      updatedAt: new Date(),
    };

    const saved = await this.prisma.otp.upsert({
      where: { id: entity.id.value },
      create: {
        ...data,
        createdAt: entity.createdAt,
      },
      update: data,
    });

    return this.toDomainEntity(saved);
  }

  async findById(id: UuidValueObject): Promise<OtpEntity | null> {
    const otp = await this.prisma.otp.findUnique({
      where: { id: id.value },
    });

    return otp ? this.toDomainEntity(otp) : null;
  }

  async findByUserId(userId: UuidValueObject): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { userId: userId.value },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findByEmail(email: string): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { email },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findByType(type: string): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { type: type as any },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findByStatus(status: string): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { status: status as any },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findByDateRange(startDate?: Date, endDate?: Date): Promise<OtpEntity[]> {
    const where: any = {};
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = startDate;
      if (endDate) where.createdAt.lte = endDate;
    }

    const otps = await this.prisma.otp.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findValidOtpByUserAndType(userId: UuidValueObject, email: string, type: string): Promise<OtpEntity | null> {
    const otp = await this.prisma.otp.findFirst({
      where: {
        userId: userId.value,
        email,
        type: type as any,
        status: PrismaOtpStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    return otp ? this.toDomainEntity(otp) : null;
  }

  async findExpiredOtps(): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { 
        expiresAt: { lt: new Date() },
        status: PrismaOtpStatus.PENDING
      },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findPendingOtps(): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { 
        status: PrismaOtpStatus.PENDING,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findVerifiedOtps(): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { status: PrismaOtpStatus.VERIFIED },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findUsedOtps(): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { status: PrismaOtpStatus.USED },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async search(criteria: OtpSearchCriteria): Promise<OtpSearchResult> {
    const where: any = {};
    
    if (criteria.userId) {
      where.userId = criteria.userId.value;
    }
    if (criteria.email) {
      where.email = criteria.email;
    }
    if (criteria.type) {
      where.type = criteria.type as any;
    }
    if (criteria.status) {
      where.status = criteria.status as any;
    }
    if (criteria.startDate || criteria.endDate) {
      where.createdAt = {};
      if (criteria.startDate) where.createdAt.gte = criteria.startDate;
      if (criteria.endDate) where.createdAt.lte = criteria.endDate;
    }

    const page = criteria.page || 1;
    const limit = criteria.limit || 10;
    const skip = (page - 1) * limit;

    const [otps, total] = await Promise.all([
      this.prisma.otp.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [criteria.sortBy || 'createdAt']: criteria.sortOrder || 'desc',
        },
      }),
      this.prisma.otp.count({ where }),
    ]);

    return {
      otps: otps.map(otp => this.toDomainEntity(otp)),
      total,
      page,
      limit,
    };
  }

  async findByUserAndEmail(userId: UuidValueObject, email: string): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { 
        userId: userId.value,
        email
      },
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findRecentOtpsByUser(userId: UuidValueObject, limit: number): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      where: { userId: userId.value },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async findAll(): Promise<OtpEntity[]> {
    const otps = await this.prisma.otp.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return otps.map(otp => this.toDomainEntity(otp));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.otp.delete({
      where: { id: id.value },
    });
  }

  private toDomainEntity(prismaOtp: any): OtpEntity {
    return OtpEntity.fromPersistence({
      id: UuidValueObject.fromString(prismaOtp.id),
      userId: UuidValueObject.fromString(prismaOtp.userId),
      email: prismaOtp.email,
      code: OtpCode.fromPersistence(prismaOtp.code),
      type: OtpType.fromPersistence(prismaOtp.type),
      status: OtpStatus.fromPersistence(prismaOtp.status),
      expiresAt: prismaOtp.expiresAt,
      verifiedAt: prismaOtp.verifiedAt,
      usedAt: prismaOtp.usedAt,
      attempts: prismaOtp.attempts,
      maxAttempts: prismaOtp.maxAttempts,
      metadata: prismaOtp.metadata,
      createdAt: prismaOtp.createdAt,
      updatedAt: prismaOtp.updatedAt,
    });
  }
}
