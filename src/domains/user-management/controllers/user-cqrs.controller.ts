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
import { CommandBus } from '../cqrs/user-command-bus';
import { QueryBus } from '../cqrs/user-query-bus';
import { CreateUserCommand } from '../commands/create-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { ChangeUserRoleCommand } from '../commands/change-user-role.command';
import { DeactivateUserCommand } from '../commands/deactivate-user.command';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { SearchUsersQuery } from '../queries/search-users.query';
import { GetUserActivityQuery } from '../queries/get-user-activity.query';
import { UserResponseDto } from '../dtos/user.dto';

@ApiTags('Users CQRS')
@Controller('users-cqrs')
export class UserCqrsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Create a new user using CQRS' })
  @ApiResponse({ 
    status: 201, 
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed or email/phone already exists' 
  })
  async createUser(@Body() createUserDto: any): Promise<UserResponseDto> {
    const command = new CreateUserCommand(createUserDto);
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID using CQRS' })
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
    const query = new GetUserByIdQuery({ id });
    const user = await this.queryBus.execute(query);
    return user ? this.mapToResponseDto(user) : null;
  }

  @Get()
  @ApiOperation({ summary: 'Search users using CQRS' })
  @ApiQuery({ name: 'q', description: 'Search query', required: false })
  @ApiResponse({ 
    status: 200, 
    description: 'Users found',
    type: [UserResponseDto]
  })
  async searchUsers(@Query('q') query?: string): Promise<UserResponseDto[]> {
    const searchQuery = new SearchUsersQuery({ query });
    const users = await this.queryBus.execute(searchQuery);
    return users.map(user => this.mapToResponseDto(user));
  }

  @Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Update user using CQRS' })
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
    @Body() updateUserDto: any
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand({ id, ...updateUserDto });
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }

  @Put(':id/role')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @ApiOperation({ summary: 'Change user role using CQRS' })
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
    @Body() changeRoleDto: { role: string }
  ): Promise<UserResponseDto> {
    const command = new ChangeUserRoleCommand({ id, role: changeRoleDto.role as any });
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user using CQRS' })
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
    const command = new DeactivateUserCommand({ id });
    await this.commandBus.execute(command);
  }

  @Get(':id/activity')
  @ApiOperation({ summary: 'Get user activity status using CQRS' })
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
    const query = new GetUserActivityQuery({ id });
    return await this.queryBus.execute(query);
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
