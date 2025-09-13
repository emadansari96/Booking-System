import { Injectable } from '@nestjs/common';
import { GetUserActivityQuery } from '../get-user-activity.query';
import { UserDomainService } from '../../services/user-domain.service';

@Injectable()
export class GetUserActivityHandler {
  constructor(private readonly userService: UserDomainService) {}

  async handle(query: GetUserActivityQuery) {
    const user = await this.userService.getUserById(query.id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || null
    };
  }
}
