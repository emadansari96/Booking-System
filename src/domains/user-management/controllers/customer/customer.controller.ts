import { Controller, Get, Put, Body, Request, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';
// User Management
import { GetUserByIdQuery } from '../../queries/get-user-by-id.query';
// DTOs
import { UpdateUserDto } from '../../dtos/user.dto';
@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly queryBus: QueryBus
  ) {}

  // ===== PROFILE MANAGEMENT =====
  @Get('profile')
      async getProfile(@Request() req: any): Promise<any> {
    const query = new GetUserByIdQuery({ id: req.user.id });
    const user = await this.queryBus.execute(query);
    if (!user) {
      return null;
    }
    return {
      id: user.id.value,
      email: user.email.value,
      firstName: user.name.firstName,
      lastName: user.name.lastName,
      phone: user.phone?.value,
      role: user.role.value,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
  }
@Put('profile')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
      async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto
  ): Promise<any> {
    // TODO: Implement profile update
    return { message: 'Profile update not implemented yet' };
  }
}