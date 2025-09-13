import { Injectable } from '@nestjs/common';
import { SearchUsersQuery } from '../search-users.query';
import { UserDomainService } from '../../services/user-domain.service';

@Injectable()
export class SearchUsersHandler {
  constructor(private readonly userService: UserDomainService) {}

  async handle(query: SearchUsersQuery) {
    if (!query.query) {
      return await this.userService.getAllUsers();
    }
    return await this.userService.searchUsers(query.query);
  }
}
