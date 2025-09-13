import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserActivityQuery } from '../get-user-activity.query';
import { UserDomainService } from '../../services/user-domain.service';
@Injectable()
@QueryHandler(GetUserActivityQuery)
export class GetUserActivityHandler implements IQueryHandler<GetUserActivityQuery> {
  constructor(private readonly userService: UserDomainService) {}

  async execute(query: GetUserActivityQuery) {
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
