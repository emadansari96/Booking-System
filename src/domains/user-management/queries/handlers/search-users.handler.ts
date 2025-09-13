import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { SearchUsersQuery } from '../search-users.query';
import { UserDomainService } from '../../services/user-domain.service';
@Injectable()
@QueryHandler(SearchUsersQuery)
export class SearchUsersHandler implements IQueryHandler<SearchUsersQuery> {
  constructor(private readonly userService: UserDomainService) {}

  async execute(query: SearchUsersQuery) {
    if (!query.query) {
      return await this.userService.getAllUsers();
    }
    return await this.userService.searchUsers(query.query);
  }
}
