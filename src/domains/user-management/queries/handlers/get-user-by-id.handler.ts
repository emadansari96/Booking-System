import { Injectable } from '@nestjs/common';
import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { UserDomainService } from '../../services/user-domain.service';
@Injectable()
@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly userService: UserDomainService) {}

  async execute(query: GetUserByIdQuery) {
    return await this.userService.getUserById(query.id);
  }
}
