// src/shared/infrastructure/database/repositories/user.repository.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../domains/user-management/entites/user.entity';
import { UuidValueObject } from '../../../../shared/domain/base/value-objects/uuid.value-object';
import { Email } from '../../../../domains/user-management/value-objects/email.value-object';
import { Name } from '../../../../domains/user-management/value-objects/name.value-objects';
import { PhoneNumber } from '../../../../domains/user-management/value-objects/phone-number.value-object';
import { UserRole } from '../../../../domains/user-management/value-objects/user-role.value-object';
import { UserEntity } from '../entities/user.entity';
import { HashingService } from '../../security/hashing.service';

@Injectable()
export class TypeOrmUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly hashingService: HashingService
  ) {}

  async save(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    const savedEntity = await this.userRepository.save(userEntity);
    return this.toDomain(savedEntity);
  }

  async findById(id: UuidValueObject): Promise<User | null> {
    const entity = await this.userRepository.findOne({
      where: { id: id.value }
    });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(): Promise<User[]> {
    const entities = await this.userRepository.find();
    return entities.map(entity => this.toDomain(entity));
  }

  async delete(id: UuidValueObject): Promise<void> {
    await this.userRepository.delete(id.value);
  }

  async findByEmail(email: Email): Promise<User | null> {
    const emailHash = this.hashingService.hashSensitiveData(email.value);
    const entity = await this.userRepository.findOne({
      where: { emailHash }
    });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const phoneHash = this.hashingService.hashSensitiveData(phone);
    const entity = await this.userRepository.findOne({
      where: { phoneHash }
    });
    
    return entity ? this.toDomain(entity) : null;
  }

  async findActiveUsers(): Promise<User[]> {
    const entities = await this.userRepository.find({
      where: { isActive: true }
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async findUsersByRole(role: string): Promise<User[]> {
    const entities = await this.userRepository.find({
      where: { role }
    });
    
    return entities.map(entity => this.toDomain(entity));
  }

  async existsByEmail(email: Email): Promise<boolean> {
    const emailHash = this.hashingService.hashSensitiveData(email.value);
    const count = await this.userRepository.count({
      where: { emailHash }
    });
    
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const phoneHash = this.hashingService.hashSensitiveData(phone);
    const count = await this.userRepository.count({
      where: { phoneHash }
    });
    
    return count > 0;
  }

  async searchByEmailPartial(emailPartial: string): Promise<User[]> {
    const searchHash = this.hashingService.createSearchableHash(emailPartial);
    const entities = await this.userRepository
      .createQueryBuilder('user')
      .where('user.emailHash LIKE :searchHash', { searchHash: `%${searchHash}%` })
      .getMany();
    
    return entities.map(entity => this.toDomain(entity));
  }

  async searchByNamePartial(namePartial: string): Promise<User[]> {
    const searchHash = this.hashingService.createSearchableHash(namePartial);
    const entities = await this.userRepository
      .createQueryBuilder('user')
      .where('user.firstNameHash LIKE :searchHash OR user.lastNameHash LIKE :searchHash', 
        { searchHash: `%${searchHash}%` })
      .getMany();
    
    return entities.map(entity => this.toDomain(entity));
  }

  // ✅ Mapper methods
  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    entity.id = user.id.value;
    entity.email = user.email.value;
    entity.emailHash = this.hashingService.hashSensitiveData(user.email.value);
    entity.firstName = user.name.firstName;
    entity.lastName = user.name.lastName;
    entity.firstNameHash = this.hashingService.hashSensitiveData(user.name.firstName);
    entity.lastNameHash = this.hashingService.hashSensitiveData(user.name.lastName);
    entity.phone = user.phone.value;
    entity.phoneHash = this.hashingService.hashSensitiveData(user.phone.value);
    entity.role = user.role.value;
    entity.isActive = user.isActive;
    entity.avatarUrl = user.avatarUrl;
    entity.lastLoginAt = user.lastLoginAt;
    
    return entity;
  }

  private toDomain(entity: UserEntity): User {
    return User.create(
      UuidValueObject.fromString(entity.id),
      new Email(entity.email),
      new Name(entity.firstName, entity.lastName),
      new PhoneNumber(entity.phone),
      entity.role as UserRole,
      entity.avatarUrl
    );
  }
}