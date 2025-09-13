// src/shared/infrastructure/security/hashing.service.ts
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
@Injectable()
export class HashingService {
  private readonly saltRounds = 12;
  private readonly secretKey = process.env.HASHING_SECRET_KEY || 'default-secret';

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  hashSensitiveData(data: string): string {
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(data)
      .digest('hex');
  }

  createSearchableHash(data: string): string {
    const words = data.toLowerCase().split(' ');
    const hashes = words.map(word => 
      crypto.createHmac('sha256', this.secretKey).update(word).digest('hex')
    );
    return hashes.join('|');
  }
}