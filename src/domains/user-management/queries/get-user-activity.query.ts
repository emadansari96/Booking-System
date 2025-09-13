import { IsString } from 'class-validator';

export class GetUserActivityQuery {
  @IsString()
  id: string;

  constructor(data: { id: string }) {
    this.id = data.id;
  }
}
