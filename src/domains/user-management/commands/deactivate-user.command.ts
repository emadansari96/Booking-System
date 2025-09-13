import { IsString } from 'class-validator';

export class DeactivateUserCommand {
  @IsString()
  id: string;

  constructor(data: { id: string }) {
    this.id = data.id;
  }
}
