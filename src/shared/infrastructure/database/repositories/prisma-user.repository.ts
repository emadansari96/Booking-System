import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserRole as PrismaUserRole } from '@prisma/client';
import { UserRepositoryInterface } from '../../../../domains/user-management/interfaces/user-repository.interface';
import { User } from '../../../../domains/user-management/entites/user.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { Email } from '../../../../domains/user-management/value-objects/email.value-object';
import { Name } from '../../../../domains/user-management/value-objects/name.value-objects';
import { PhoneNumber } from '../../../../domains/user-management/value-objects/phone-number.value-object';
import { UserRoleValue, UserRole } from '../../../../domains/user-management/value-objects/user-role.value-object';
// Helper function to map domain UserRole to Prisma UserRole
function mapUserRole(domainRole: UserRole): PrismaUserRole {
  switch (domainRole) {
    case UserRole.CUSTOMER:
      return PrismaUserRole.CUSTOMER;
    case UserRole.ADMIN:
      return PrismaUserRole.ADMIN;
    case UserRole.MANAGER:
      return PrismaUserRole.MANAGER;
    default:
      throw new Error(`Unknown user role: ${domainRole}`);
  }
}

// Helper function to map Prisma UserRole to domain UserRole
function mapPrismaUserRole(prismaRole: PrismaUserRole): UserRole {
  switch (prismaRole) {
    case PrismaUserRole.CUSTOMER:
      return UserRole.CUSTOMER;
    case PrismaUserRole.ADMIN:
      return UserRole.ADMIN;
    case PrismaUserRole.MANAGER:
      return UserRole.MANAGER;
    default:
      throw new Error(`Unknown Prisma user role: ${prismaRole}`);
  }
}
@Injectable()
export class PrismaUserRepository implements UserRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async save(user: User): Promise<User> {
    const userData = {
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      phone: user.phone.value,
      password: user.password,
      role: mapUserRole(user.role.value),
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
    };

    const savedUser = await this.prisma.user.upsert({
      where: { id: userData.id },
      create: userData,
      update: userData,
    });

    return this.toDomainEntity(savedUser);
  }

  async findById(id: UuidValueObject): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: id.value },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.value },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { phone },
    });

    return user ? this.toDomainEntity(user) : null;
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.toDomainEntity(user));
  }

  async findActiveUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.toDomainEntity(user));
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { role: role as PrismaUserRole },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.toDomainEntity(user));
  }

  async searchByEmailPartial(emailPartial: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { 
        email: { contains: emailPartial, mode: 'insensitive' }
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.toDomainEntity(user));
  }

  async searchByNamePartial(namePartial: string): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { 
        OR: [
          { firstName: { contains: namePartial, mode: 'insensitive' } },
          { lastName: { contains: namePartial, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map(user => this.toDomainEntity(user));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.prisma.user.delete({
      where: { id: id.value },
    });
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email: email.value },
    });

    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { phone },
    });

    return count > 0;
  }

  private toDomainEntity(prismaUser: any): User {
    return User.fromPersistence(
      UuidValueObject.fromString(prismaUser.id),
      new Email(prismaUser.email),
      new Name(prismaUser.firstName, prismaUser.lastName),
      new PhoneNumber(prismaUser.phone),
      prismaUser.password, // Already hashed from database
      mapPrismaUserRole(prismaUser.role),
      prismaUser.avatarUrl,
      prismaUser.isActive,
      prismaUser.lastLoginAt
    );
  }
}
