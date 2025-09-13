import { Injectable } from '@nestjs/common';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { SearchUsersQuery } from '../queries/search-users.query';
import { GetUserActivityQuery } from '../queries/get-user-activity.query';
import { GetUserByIdHandler } from '../queries/handlers/get-user-by-id.handler';
import { SearchUsersHandler } from '../queries/handlers/search-users.handler';
import { GetUserActivityHandler } from '../queries/handlers/get-user-activity.handler';

@Injectable()
export class QueryBus {
  constructor(
    private readonly getUserByIdHandler: GetUserByIdHandler,
    private readonly searchUsersHandler: SearchUsersHandler,
    private readonly getUserActivityHandler: GetUserActivityHandler
  ) {}

  async execute(query: GetUserByIdQuery): Promise<any>;
  async execute(query: SearchUsersQuery): Promise<any[]>;
  async execute(query: GetUserActivityQuery): Promise<{ isActive: boolean; lastLoginAt: Date | null }>;
  async execute(query: GetUserByIdQuery | SearchUsersQuery | GetUserActivityQuery): Promise<any> {
    if (query instanceof GetUserByIdQuery) {
      return await this.getUserByIdHandler.handle(query);
    } else if (query instanceof SearchUsersQuery) {
      return await this.searchUsersHandler.handle(query);
    } else if (query instanceof GetUserActivityQuery) {
      return await this.getUserActivityHandler.handle(query);
    }
  }
}
