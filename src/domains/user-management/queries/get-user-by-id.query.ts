import { IsString } from 'class-validator';
export class GetUserByIdQuery {
  @IsString()
  id: string;

  constructor(data: { id: string }) {
    this.id = data.id;
  }
}
