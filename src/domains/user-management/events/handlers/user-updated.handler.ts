import { Injectable } from '@nestjs/common';
import { UserUpdatedEvent } from '../user-updated.event';
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service';

@Injectable()
export class UserUpdatedHandler {
  constructor(private readonly redisService: RedisService) {}

  async handle(event: UserUpdatedEvent) {
    // Update cached user data
    const cachedUser = await this.redisService.get(`user:${event.userId}`);
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      const updatedUser = { ...userData, ...event };
      await this.redisService.set(
        `user:${event.userId}`,
        JSON.stringify(updatedUser),
        3600
      );
    }
  }
}
