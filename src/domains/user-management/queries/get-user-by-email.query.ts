import { Query } from '@nestjs/cqrs';

export class GetUserByEmailQuery extends Query<any> {
  constructor(public readonly email: string) {
    super();
  }
}
