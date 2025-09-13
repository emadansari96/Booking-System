import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserByEmailQuery } from '../../queries/get-user-by-email.query';
import { UserDomainService } from '../../services/user-domain.service';
@QueryHandler(GetUserByEmailQuery)
export class GetUserByEmailHandler implements IQueryHandler<GetUserByEmailQuery> {
  constructor(private readonly userDomainService: UserDomainService) {}

  async execute(query: GetUserByEmailQuery) {
    return this.userDomainService.getUserByEmail(query.email);
  }
}
