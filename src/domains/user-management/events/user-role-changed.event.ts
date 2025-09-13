import { UserRole } from '../dtos/user-role.dto';
export class UserRoleChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldRole: UserRole,
    public readonly newRole: UserRole
  ) {}
}
