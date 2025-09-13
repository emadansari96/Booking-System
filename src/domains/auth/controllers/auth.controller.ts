import { Controller, Post, HttpCode, HttpStatus, Get, Body, Request } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from '../dto/password-reset.dto';
import { AuthResponseDto, RegisterResponseDto } from '../dto/auth-response.dto';
import { Public } from '../../../shared/decorators/public.decorator';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
@Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
          async register(@Body() registerDto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }
@Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
            async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
@Public()
  @Post('password-reset/request')
  @HttpCode(HttpStatus.OK)
        async requestPasswordReset(
    @Body() requestDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    return this.authService.requestPasswordReset(requestDto);
  }
@Public()
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.OK)
        async resetPassword(
    @Body() resetDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(resetDto);
  }
@Get('profile')
          async getProfile(@Request() req: any): Promise<any> {
    return {
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      isActive: req.user.isActive,
    };
  }
}
