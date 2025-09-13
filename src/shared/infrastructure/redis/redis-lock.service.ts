import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export interface LockOptions {
  ttl?: number; // Time to live in seconds
  retryDelay?: number; // Delay between retries in milliseconds
  maxRetries?: number; // Maximum number of retries
}

export interface LockResult {
  success: boolean;
  lockKey?: string;
  error?: string;
}
@Injectable()
export class RedisLockService {
  private readonly logger = new Logger(RedisLockService.name);
  private readonly redis: Redis;

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      maxRetriesPerRequest: 3,
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  /**
   * Acquire a lock for a booking period
   */
  async acquireBookingLock(
    resourceItemId: string,
    startDate: Date,
    endDate: Date,
    options: LockOptions = {}
  ): Promise<LockResult> {
    const lockKey = this.generateBookingLockKey(resourceItemId, startDate, endDate);
    const ttl = options.ttl || 30; // Default 30 seconds
    const retryDelay = options.retryDelay || 100;
    const maxRetries = options.maxRetries || 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.redis.set(lockKey, 'locked', 'EX', ttl, 'NX');
        
        if (result === 'OK') {
          this.logger.log(`Booking lock acquired: ${lockKey}`);
          return {
            success: true,
            lockKey,
          };
        }

        if (attempt < maxRetries) {
          this.logger.warn(`Booking lock attempt ${attempt + 1} failed, retrying in ${retryDelay}ms`);
          await this.sleep(retryDelay);
        }
      } catch (error) {
        this.logger.error(`Error acquiring booking lock: ${error.message}`);
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to acquire lock after ${maxRetries + 1} attempts: ${error.message}`,
          };
        }
        await this.sleep(retryDelay);
      }
    }

    return {
      success: false,
      error: `Failed to acquire lock after ${maxRetries + 1} attempts`,
    };
  }

  /**
   * Release a booking lock
   */
  async releaseBookingLock(lockKey: string): Promise<boolean> {
    try {
      const result = await this.redis.del(lockKey);
      this.logger.log(`Booking lock released: ${lockKey}`);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error releasing booking lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a booking period is locked
   */
  async isBookingLocked(
    resourceItemId: string,
    startDate: Date,
    endDate: Date
  ): Promise<boolean> {
    const lockKey = this.generateBookingLockKey(resourceItemId, startDate, endDate);
    
    try {
      const result = await this.redis.exists(lockKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking booking lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Extend a booking lock TTL
   */
  async extendBookingLock(lockKey: string, ttl: number = 30): Promise<boolean> {
    try {
      const result = await this.redis.expire(lockKey, ttl);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error extending booking lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Acquire a general purpose lock
   */
  async acquireLock(
    key: string,
    value: string = 'locked',
    options: LockOptions = {}
  ): Promise<LockResult> {
    const ttl = options.ttl || 30;
    const retryDelay = options.retryDelay || 100;
    const maxRetries = options.maxRetries || 3;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.redis.set(key, value, 'EX', ttl, 'NX');
        
        if (result === 'OK') {
          this.logger.log(`Lock acquired: ${key}`);
          return {
            success: true,
            lockKey: key,
          };
        }

        if (attempt < maxRetries) {
          await this.sleep(retryDelay);
        }
      } catch (error) {
        this.logger.error(`Error acquiring lock: ${error.message}`);
        if (attempt === maxRetries) {
          return {
            success: false,
            error: `Failed to acquire lock after ${maxRetries + 1} attempts: ${error.message}`,
          };
        }
        await this.sleep(retryDelay);
      }
    }

    return {
      success: false,
      error: `Failed to acquire lock after ${maxRetries + 1} attempts`,
    };
  }

  /**
   * Release a general purpose lock
   */
  async releaseLock(key: string, expectedValue?: string): Promise<boolean> {
    try {
      if (expectedValue) {
        // Use Lua script for atomic check-and-delete
        const script = `
          if redis.call("GET", KEYS[1]) == ARGV[1] then
            return redis.call("DEL", KEYS[1])
          else
            return 0
          end
        `;
        const result = await this.redis.eval(script, 1, key, expectedValue);
        return result === 1;
      } else {
        const result = await this.redis.del(key);
        return result === 1;
      }
    } catch (error) {
      this.logger.error(`Error releasing lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a key is locked
   */
  async isLocked(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking lock: ${error.message}`);
      return false;
    }
  }

  /**
   * Get lock TTL
   */
  async getLockTTL(key: string): Promise<number> {
    try {
      const ttl = await this.redis.ttl(key);
      return ttl;
    } catch (error) {
      this.logger.error(`Error getting lock TTL: ${error.message}`);
      return -1;
    }
  }

  /**
   * Clean up expired locks (utility method)
   */
  async cleanupExpiredLocks(pattern: string = 'booking:lock:*'): Promise<number> {
    try {
      const keys = await this.redis.keys(pattern);
      let cleanedCount = 0;

      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) { // Key exists but has no expiration
          await this.redis.del(key);
          cleanedCount++;
        }
      }

      this.logger.log(`Cleaned up ${cleanedCount} expired locks`);
      return cleanedCount;
    } catch (error) {
      this.logger.error(`Error cleaning up expired locks: ${error.message}`);
      return 0;
    }
  }

  /**
   * Generate booking lock key
   */
  private generateBookingLockKey(
    resourceItemId: string,
    startDate: Date,
    endDate: Date
  ): string {
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    return `booking:lock:${resourceItemId}:${start}:${end}`;
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close Redis connection
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}