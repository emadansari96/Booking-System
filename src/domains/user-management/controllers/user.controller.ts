// src/domains/user-management/controllers/user.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Query, 
  UsePipes, 
  ValidationPipe,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { UserDomainService } from '../services/user-domain.service';
import { CreateUserDto, UpdateUserDto, ChangeUserRoleDto, UserResponseDto } from '../dtos/user.dto';
import { UserRole } from '../dtos/user-role.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserDomainService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed or email/phone already exists' 
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.userService.createUser(createUserDto);
    return this.mapToResponseDto(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'User found',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto | null> {
    const user = await this.userService.getUserById(id);
    return user ? this.mapToResponseDto(user) : null;
  }

  @Get()
  @ApiOperation({ summary: 'Search users' })
  @ApiQuery({ name: 'q', description: 'Search query', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Users found',
    type: [UserResponseDto]
  })
  async searchUsers(@Query('q') query?: string): Promise<UserResponseDto[]> {
    if (!query) {
      // Return all users if no query provided
      const users = await this.userService.getAllUsers();
      return users.map(user => this.mapToResponseDto(user));
    }
    
    const users = await this.userService.searchUsers(query);
    return users.map(user => this.mapToResponseDto(user));
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed or email/phone already exists' 
  })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUser(id, updateUserDto);
    return this.mapToResponseDto(user);
  }

  @Put(':id/role')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Change user role' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'User role changed successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid role or role change not allowed' 
  })
  async changeUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeRoleDto: ChangeUserRoleDto
  ): Promise<UserResponseDto> {
    const user = await this.userService.changeUserRole(id, changeRoleDto.role);
    return this.mapToResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 204, 
    description: 'User deactivated successfully' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async deactivateUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.userService.deactivateUser(id);
  }

  @Post(':id/activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'User activated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async activateUser(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    const user = await this.userService.activateUser(id);
    return this.mapToResponseDto(user);
  }

  @Get(':id/avatar')
  @ApiOperation({ summary: 'Get user avatar URL' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Avatar URL retrieved',
    schema: { type: 'object', properties: { avatarUrl: { type: 'string' } } }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async getUserAvatar(@Param('id', ParseUUIDPipe) id: string): Promise<{ avatarUrl: string | null }> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return { avatarUrl: user.avatarUrl || null };
  }

  @Put(':id/avatar')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update user avatar' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'Avatar updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async updateUserAvatar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { avatarUrl: string }
  ): Promise<UserResponseDto> {
    const user = await this.userService.updateUserAvatar(id, body.avatarUrl);
    return this.mapToResponseDto(user);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity status' })
  @ApiParam({ name: 'id', description: 'User UUID', type: 'string' })
  @ApiResponse({ 
    status: 200, 
    description: 'User activity status',
    schema: { 
      type: 'object', 
      properties: { 
        isActive: { type: 'boolean' },
        lastLoginAt: { type: 'string', format: 'date-time' }
      } 
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  async getUserActivity(@Param('id', ParseUUIDPipe) id: string): Promise<{
    isActive: boolean;
    lastLoginAt: Date | null;
  }> {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return {
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt || null
    };
  }

  // ✅ Helper method to map domain entity to response DTO
  private mapToResponseDto(user: any): UserResponseDto {
    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      phone: user.phone.value,
      role: user.role.value,
      isActive: user.isActive,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
}