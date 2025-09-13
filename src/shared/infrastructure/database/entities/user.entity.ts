// src/shared/infrastructure/database/entities/user.entity.ts
import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  emailHash: string; 

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  firstNameHash: string; 

  @Column()
  lastNameHash: string; 

  @Column()
  phone: string;

  @Column()
  phoneHash: string; 

  @Column({ type: 'enum', enum: ['customer', 'admin', 'manager'] })
  role: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  avatarUrl: string;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}