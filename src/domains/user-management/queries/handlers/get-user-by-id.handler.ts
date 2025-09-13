import { Injectable } from '@nestjs/common';
import { GetUserByIdQuery } from '../get-user-by-id.query';
import { UserDomainService } from '../../services/user-domain.service';

@Injectable()
export class GetUserByIdHandler {
  constructor(private readonly userService: UserDomainService) {}

  async handle(query: GetUserByIdQuery) {
    return await this.userService.getUserById(query.id);
  }
}
