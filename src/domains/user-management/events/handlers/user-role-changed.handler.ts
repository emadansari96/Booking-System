import { Injectable } from '@nestjs/common';
import { UserRoleChangedEvent } from '../user-role-changed.event';
import { RedisService } from '../../../../shared/infrastructure/redis/redis.service';

@Injectable()
export class UserRoleChangedHandler {
  constructor(private readonly redisService: RedisService) {}

  async handle(event: UserRoleChangedEvent) {
    // Update user role in cache
    const cachedUser = await this.redisService.get(`user:${event.userId}`);
    if (cachedUser) {
      const userData = JSON.parse(cachedUser);
      userData.role = event.newRole;
      await this.redisService.set(
        `user:${event.userId}`,
        JSON.stringify(userData),
        3600
      );
    }

    // Log role change for audit
    await this.redisService.lPush(
      'audit:role-changes',
      JSON.stringify({
        userId: event.userId,
        oldRole: event.oldRole,
        newRole: event.newRole,
        timestamp: new Date().toISOString()
      })
    );
  }
}
