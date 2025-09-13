// src/domains/user-management/services/user-domain.service.ts
import { Injectable, Inject } from '@nestjs/common';
import { TypeOrmUserRepository } from '../../../shared/infrastructure/database/repositories/user.repository';
import { User } from '../entites/user.entity';
import { UuidValueObject } from '../../../shared/domain/base/value-objects/uuid.value-object';
import { Email } from '../value-objects/email.value-object';
import { Name } from '../value-objects/name.value-objects';
import { PhoneNumber } from '../value-objects/phone-number.value-object';
import { UserRole } from '../value-objects/user-role.value-object';
import { CreateUserDto } from '../dtos/user.dto';
import { AuditLogService } from '../../audit-log/services/audit-log.service';
import { AuditDomain } from '../../audit-log/value-objects/audit-domain.value-object';
import { AuditAction } from '../../audit-log/value-objects/audit-action.value-object';
import { AuditStatus } from '../../audit-log/value-objects/audit-status.value-object';
import { AuditSeverity } from '../../audit-log/value-objects/audit-severity.value-object';

@Injectable()
export class UserDomainService {
  constructor(
    private readonly userRepository: TypeOrmUserRepository,
    private readonly auditLogService: AuditLogService
  ) {}

  async createUser(dto: CreateUserDto, currentUserId?: UuidValueObject): Promise<User> {
    try {
      const email = new Email(dto.email);
      if (await this.userRepository.existsByEmail(email)) {
        await this.auditLogService.logFailedOperation(
          currentUserId,
          AuditDomain.USER_MANAGEMENT,
          'User',
          'unknown',
          AuditAction.CREATE,
          'Email already exists'
        );
        throw new Error('Email already exists');
      }

      const phone = new PhoneNumber(dto.phone);
      if (await this.userRepository.existsByPhone(phone.value)) {
        await this.auditLogService.logFailedOperation(
          currentUserId,
          AuditDomain.USER_MANAGEMENT,
          'User',
          'unknown',
          AuditAction.CREATE,
          'Phone number already exists'
        );
        throw new Error('Phone number already exists');
      }

      const user = User.create(
        UuidValueObject.generate(),
        email,
        new Name(dto.firstName, dto.lastName),
        phone,
        dto.role || UserRole.CUSTOMER,
        dto.avatarUrl
      );

      const savedUser = await this.userRepository.save(user);

      // Log successful user creation
      await this.auditLogService.logEntityCreation(
        currentUserId,
        AuditDomain.USER_MANAGEMENT,
        'User',
        savedUser.id.value,
        {
          email: savedUser.email.value,
          firstName: savedUser.name.firstName,
          lastName: savedUser.name.lastName,
          phone: savedUser.phone.value,
          role: savedUser.role.value,
        }
      );

      return savedUser;
    } catch (error) {
      await this.auditLogService.logFailedOperation(
        currentUserId,
        AuditDomain.USER_MANAGEMENT,
        'User',
        'unknown',
        AuditAction.CREATE,
        error.message
      );
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    return this.userRepository.findById(UuidValueObject.fromString(id));
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(new Email(email));
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async updateUser(id: string, updates: Partial<CreateUserDto>, currentUserId?: UuidValueObject): Promise<User> {
    try {
      const user = await this.userRepository.findById(UuidValueObject.fromString(id));
      if (!user) {
        await this.auditLogService.logFailedOperation(
          currentUserId,
          AuditDomain.USER_MANAGEMENT,
          'User',
          id,
          AuditAction.UPDATE,
          'User not found'
        );
        throw new Error('User not found');
      }

      const oldValues = {
        email: user.email.value,
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        phone: user.phone.value,
        avatarUrl: user.avatarUrl,
      };

      if (updates.email) {
        const newEmail = new Email(updates.email);
        if (await this.userRepository.existsByEmail(newEmail)) {
          await this.auditLogService.logFailedOperation(
            currentUserId,
            AuditDomain.USER_MANAGEMENT,
            'User',
            id,
            AuditAction.UPDATE,
            'Email already exists'
          );
          throw new Error('Email already exists');
        }
        user.changeEmail(newEmail);
      }

      if (updates.firstName || updates.lastName) {
        const newName = new Name(
          updates.firstName || user.name.firstName,
          updates.lastName || user.name.lastName
        );
        user.updateName(newName);
      }

      if (updates.phone) {
        const newPhone = new PhoneNumber(updates.phone);
        if (await this.userRepository.existsByPhone(newPhone.value)) {
          await this.auditLogService.logFailedOperation(
            currentUserId,
            AuditDomain.USER_MANAGEMENT,
            'User',
            id,
            AuditAction.UPDATE,
            'Phone number already exists'
          );
          throw new Error('Phone number already exists');
        }
        user.updatePhone(newPhone);
      }

      if (updates.avatarUrl) {
        user.updateAvatar(updates.avatarUrl);
      }

      const updatedUser = await this.userRepository.save(user);

      const newValues = {
        email: updatedUser.email.value,
        firstName: updatedUser.name.firstName,
        lastName: updatedUser.name.lastName,
        phone: updatedUser.phone.value,
        avatarUrl: updatedUser.avatarUrl,
      };

      // Log successful user update
      await this.auditLogService.logEntityUpdate(
        currentUserId,
        AuditDomain.USER_MANAGEMENT,
        'User',
        id,
        oldValues,
        newValues
      );

      return updatedUser;
    } catch (error) {
      await this.auditLogService.logFailedOperation(
        currentUserId,
        AuditDomain.USER_MANAGEMENT,
        'User',
        id,
        AuditAction.UPDATE,
        error.message
      );
      throw error;
    }
  }

  async changeUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.userRepository.findById(UuidValueObject.fromString(id));
    if (!user) {
      throw new Error('User not found');
    }

    user.changeRole(role);
    return this.userRepository.save(user);
  }

  async deactivateUser(id: string): Promise<void> {
    const user = await this.userRepository.findById(UuidValueObject.fromString(id));
    if (!user) {
      throw new Error('User not found');
    }

    user.deactivate();
    await this.userRepository.save(user);
  }

  async activateUser(id: string): Promise<User> {
    const user = await this.userRepository.findById(UuidValueObject.fromString(id));
    if (!user) {
      throw new Error('User not found');
    }

    user.activate();
    return this.userRepository.save(user);
  }

  async updateUserAvatar(id: string, avatarUrl: string): Promise<User> {
    const user = await this.userRepository.findById(UuidValueObject.fromString(id));
    if (!user) {
      throw new Error('User not found');
    }

    user.updateAvatar(avatarUrl);
    return this.userRepository.save(user);
  }

  async searchUsers(query: string): Promise<User[]> {
    const emailResults = await this.userRepository.searchByEmailPartial(query);
    const nameResults = await this.userRepository.searchByNamePartial(query);
    
    const allResults = [...emailResults, ...nameResults];
    const uniqueResults = allResults.filter((user, index, self) => 
      index === self.findIndex(u => u.id.equals(user.id))
    );
    
    return uniqueResults;
  }
}