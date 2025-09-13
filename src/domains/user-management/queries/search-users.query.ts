import { IsOptional, IsString } from 'class-validator';
export class SearchUsersQuery {
  @IsOptional()
  @IsString()
  query?: string;

  constructor(data: { query?: string }) {
    this.query = data.query;
  }
}
