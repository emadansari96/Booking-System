// src/shared/infrastructure/redis/redis.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    };

    this.client = new Redis(redisConfig);
    this.subscriber = new Redis(redisConfig);
    this.publisher = new Redis(redisConfig);

    // Event listeners
    this.client.on('error', (error) => {
      console.error('Redis Client Error:', error);
    });

    this.client.on('connect', () => {
      console.log('Redis Client Connected');
    });

    this.subscriber.on('error', (error) => {
      console.error('Redis Subscriber Error:', error);
    });

    this.publisher.on('error', (error) => {
      console.error('Redis Publisher Error:', error);
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<'OK'> {
    if (ttl) {
      return this.client.setex(key, ttl, value);
    }
    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // Set operations
  async setNX(key: string, value: string, ttl?: number): Promise<boolean> {
    const result = await this.client.setnx(key, value);
    if (result && ttl) {
      await this.client.expire(key, ttl);
    }
    return result === 1;
  }

  async setEX(key: string, value: string, ttl: number): Promise<'OK'> {
    return this.client.setex(key, ttl, value);
  }

  // Hash operations
  async hGet(key: string, field: string): Promise<string | null> {
    return this.client.hget(key, field);
  }

  async hSet(key: string, field: string, value: string): Promise<number> {
    return this.client.hset(key, field, value);
  }

  async hGetAll(key: string): Promise<Record<string, string>> {
    return this.client.hgetall(key);
  }

  async hDel(key: string, field: string): Promise<number> {
    return this.client.hdel(key, field);
  }

  // List operations
  async lPush(key: string, ...values: string[]): Promise<number> {
    return this.client.lpush(key, ...values);
  }

  async rPush(key: string, ...values: string[]): Promise<number> {
    return this.client.rpush(key, ...values);
  }

  async lPop(key: string): Promise<string | null> {
    return this.client.lpop(key);
  }

  async rPop(key: string): Promise<string | null> {
    return this.client.rpop(key);
  }

  async lLen(key: string): Promise<number> {
    return this.client.llen(key);
  }

  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.lrange(key, start, stop);
  }

  // Set operations
  async sAdd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async sRem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async sMembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async sIsMember(key: string, member: string): Promise<number> {
    return this.client.sismember(key, member);
  }

  // Sorted Set operations
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return this.client.zadd(key, score, member);
  }

  async zRem(key: string, member: string): Promise<number> {
    return this.client.zrem(key, member);
  }

  async zRange(key: string, start: number, stop: number): Promise<string[]> {
    return this.client.zrange(key, start, stop);
  }

  async zRangeByScore(key: string, min: number, max: number): Promise<string[]> {
    return this.client.zrangebyscore(key, min, max);
  }

  // Pub/Sub operations
  async publish(channel: string, message: string): Promise<number> {
    return this.publisher.publish(channel, message);
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (receivedChannel, message) => {
      if (receivedChannel === channel) {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  // Pipeline operations
  async pipeline(): Promise<any> {
    return this.client.pipeline();
  }

  // Transaction operations
  async multi(): Promise<any> {
    return this.client.multi();
  }

  // Utility methods
  async flushAll(): Promise<'OK'> {
    return this.client.flushall();
  }

  async flushDb(): Promise<'OK'> {
    return this.client.flushdb();
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async scan(cursor: number, pattern?: string, count?: number): Promise<[string, string[]]> {
    if (pattern && count) {
      return this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    } else if (pattern) {
      return this.client.scan(cursor, 'MATCH', pattern);
    } else if (count) {
      return this.client.scan(cursor, 'COUNT', count);
    } else {
      return this.client.scan(cursor);
    }
  }

  // Health check
  async ping(): Promise<string> {
    return this.client.ping();
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.ping();
      return true;
    } catch {
      return false;
    }
  }
}