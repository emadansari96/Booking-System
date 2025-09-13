// src/domains/user-management/controllers/user-role.controller.ts
import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe } from '@nestjs/common';
import { UserRoleService } from '../services/user-role.service';
import { UserDomainService } from '../services/user-domain.service';
import { UserRole, ChangeUserRoleDto, UserRoleResponseDto } from '../dtos/user-role.dto';

@Controller('user-roles')
export class UserRoleController {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly userService: UserDomainService
  ) {}

  @Get()
  async getAllRoles(): Promise<UserRoleResponseDto[]> {
    return this.userRoleService.getAllRoles();
  }

  @Get(':role')
  async getRoleInfo(@Param('role') role: UserRole): Promise<UserRoleResponseDto> {
    return this.userRoleService.getRoleInfo(role);
  }

  @Post('change')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async changeUserRole(@Body() changeRoleDto: ChangeUserRoleDto): Promise<{ message: string }> {
    const { userId, role } = changeRoleDto;
    
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    if (!this.userRoleService.canChangeRole(user.role.value, role)) {
      throw new Error('Role change not allowed');
    }

    await this.userService.changeUserRole(userId, role);
    
    return { message: 'User role changed successfully' };
  }

  @Get(':role/permissions')
  async getRolePermissions(@Param('role') role: UserRole): Promise<string[]> {
    const roleInfo = this.userRoleService.getRoleInfo(role);
    return roleInfo.permissions;
  }

  @Post('validate-change')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async validateRoleChange(@Body() validationDto: any): Promise<{ allowed: boolean; reason?: string }> {
    const { currentRole, targetRole, userId } = validationDto;
    
    const allowed = this.userRoleService.canChangeRole(currentRole, targetRole);
    
    if (!allowed) {
      return {
        allowed: false,
        reason: 'Role change not allowed based on current role'
      };
    }
    
    return { allowed: true };
  }
}