import { IsString, IsEnum } from 'class-validator';
import { UserRole } from '../value-objects/user-role.value-object';
export class ChangeUserRoleCommand {
  @IsString()
  id: string;
@IsEnum(UserRole)
  role: UserRole;

  constructor(data: { id: string; role: UserRole }) {
    this.id = data.id;
    this.role = data.role;
  }
}
