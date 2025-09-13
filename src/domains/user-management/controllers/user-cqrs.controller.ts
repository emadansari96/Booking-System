import { Controller, Post, Get, Put, Delete, Body, Param, Query, Request, UsePipes, ValidationPipe, HttpStatus, HttpCode, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CreateUserCommand } from '../commands/create-user.command';
import { UpdateUserCommand } from '../commands/update-user.command';
import { ChangeUserRoleCommand } from '../commands/change-user-role.command';
import { DeactivateUserCommand } from '../commands/deactivate-user.command';
import { GetUserByIdQuery } from '../queries/get-user-by-id.query';
import { SearchUsersQuery } from '../queries/search-users.query';
import { GetUserActivityQuery } from '../queries/get-user-activity.query';
import { UserResponseDto } from '../dtos/user.dto';
import { ApprovePaymentCommand } from '../../payment/commands/approve-payment.command';
import { RejectPaymentCommand } from '../../payment/commands/reject-payment.command';
import { GetPaymentsQuery } from '../../payment/queries/get-payments.query';
import { GetAuditLogsQuery } from '../../audit-log/queries/get-audit-logs.query';
@Controller('users-cqrs')
export class UserCqrsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
  ) {}
@Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
        async createUser(@Body() createUserDto: any): Promise<UserResponseDto> {
    const command = new CreateUserCommand(createUserDto);
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }
@Get()
      async getAllUsers(): Promise<UserResponseDto[]> {
    const searchQuery = new SearchUsersQuery({ query: undefined });
    const users = await this.queryBus.execute(searchQuery);
    return users.map(user => this.mapToResponseDto(user));
  }
@Get('search')
        async searchUsers(@Query('q') query?: string): Promise<UserResponseDto[]> {
    const searchQuery = new SearchUsersQuery({ query });
    const users = await this.queryBus.execute(searchQuery);
    return users.map(user => this.mapToResponseDto(user));
  }
@Get('profile')
  @UseGuards(JwtAuthGuard)
        async getProfile(@Request() req: any): Promise<UserResponseDto | null> {
    const query = new GetUserByIdQuery({ id: req.user.id });
    const user = await this.queryBus.execute(query);
    return user ? this.mapToResponseDto(user) : null;
  }
@Put('profile')
  @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async updateProfile(
    @Request() req: any,
    @Body() updateDto: any
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand({ id: req.user.id, ...updateDto });
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }
@Get(':id')
          async getUserById(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto | null> {
    const query = new GetUserByIdQuery({ id });
    const user = await this.queryBus.execute(query);
    return user ? this.mapToResponseDto(user) : null;
  }
@Put(':id')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
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
          async deactivateUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const command = new DeactivateUserCommand({ id });
    await this.commandBus.execute(command);
  }
@Get(':id/activity')
          async getUserActivity(@Param('id', ParseUUIDPipe) id: string): Promise<{
    isActive: boolean;
    lastLoginAt: Date | null;
  }> {
    const query = new GetUserActivityQuery({ id });
    return await this.queryBus.execute(query);
  }

  // ===== ADMIN ENDPOINTS =====
  @Get('admin/dashboard-stats')
  @UseGuards(JwtAuthGuard)
        async getDashboardStats() {
    return { 
      message: 'Admin dashboard stats',
      stats: {
        totalUsers: 0,
        totalBookings: 0,
        totalRevenue: 0,
        activeResources: 0
      }
    };
  }
@Get('admin/users')
  @UseGuards(JwtAuthGuard)
        async getAllUsersAdmin(): Promise<UserResponseDto[]> {
    const searchQuery = new SearchUsersQuery({ query: undefined });
    const users = await this.queryBus.execute(searchQuery);
    return users.map(user => this.mapToResponseDto(user));
  }
@Get('admin/resources')
  @UseGuards(JwtAuthGuard)
        async getAllResources() {
    return { message: 'Resource listing not implemented yet' };
  }
@Get('admin/bookings')
  @UseGuards(JwtAuthGuard)
        async getAllBookings() {
    return { message: 'Booking listing not implemented yet' };
  }
@Get('admin/audit-logs')
  @UseGuards(JwtAuthGuard)
                        async getAuditLogs(
    @Query('userId') userId?: string,
    @Query('action') action?: string,
    @Query('domain') domain?: string,
    @Query('severity') severity?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<any> {
    const query = new GetAuditLogsQuery(
      userId,
      undefined, // sessionId
      action,
      domain,
      undefined, // entityType
      undefined, // entityId
      undefined, // status
      severity,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      undefined, // ipAddress
      page,
      limit,
      'timestamp', // sortBy
      'DESC' // sortOrder
    );
    const result = await this.queryBus.execute(query);
    return result;
  }

  // ===== CUSTOMER ENDPOINTS =====
  @Get('customer/profile')
  @UseGuards(JwtAuthGuard)
        async getCustomerProfile(@Request() req: any): Promise<UserResponseDto | null> {
    const query = new GetUserByIdQuery({ id: req.user.id });
    const user = await this.queryBus.execute(query);
    return user ? this.mapToResponseDto(user) : null;
  }
@Put('customer/profile')
  @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async updateCustomerProfile(
    @Request() req: any,
    @Body() updateUserDto: any
  ): Promise<UserResponseDto> {
    const command = new UpdateUserCommand({ id: req.user.id, ...updateUserDto });
    const user = await this.commandBus.execute(command);
    return this.mapToResponseDto(user);
  }

  // ===== ADMIN PAYMENT MANAGEMENT =====
@Post('admin/payments/:paymentId/approve')
  @UseGuards(JwtAuthGuard)
          async approvePayment(
    @Request() req: any,
    @Param('paymentId', ParseUUIDPipe) paymentId: string
  ): Promise<any> {
    const command = new ApprovePaymentCommand(paymentId, req.user.id);
    const result = await this.commandBus.execute(command);
    return result;
  }
@Post('admin/payments/:paymentId/reject')
  @UseGuards(JwtAuthGuard)
          async rejectPayment(
    @Request() req: any,
    @Param('paymentId', ParseUUIDPipe) paymentId: string,
    @Body() body: { reason?: string }
  ): Promise<any> {
    const command = new RejectPaymentCommand(paymentId, req.user.id, body.reason);
    const result = await this.commandBus.execute(command);
    return result;
  }
@Get('admin/payments')
  @UseGuards(JwtAuthGuard)
                async getPayments(
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ): Promise<any> {
    const query = new GetPaymentsQuery(
      userId,
      status as any,
      page,
      limit
    );
    const result = await this.queryBus.execute(query);
    return result;
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
