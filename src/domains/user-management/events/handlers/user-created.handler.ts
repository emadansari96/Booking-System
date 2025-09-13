import { Injectable } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { UserCreatedEvent } from '../user-created.event';
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service';
@Injectable()
@EventsHandler(UserCreatedEvent)
export class UserCreatedHandler implements IEventHandler<UserCreatedEvent> {
  constructor(private readonly redisService: RedisService) {}

  async handle(event: UserCreatedEvent) {
    // Cache user data for fast access
    await this.redisService.set(
      `user:${event.userId}`,
      JSON.stringify({
        id: event.userId,
        email: event.email,
        firstName: event.firstName,
        lastName: event.lastName,
        phone: event.phone,
        role: event.role,
        avatarUrl: event.avatarUrl
      }),
      3600 // 1 hour TTL
    );

    // Add to user search index
    await this.redisService.sAdd('user:search:index', event.userId);
  }
}
