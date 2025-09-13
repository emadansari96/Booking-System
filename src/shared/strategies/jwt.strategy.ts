import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { QueryBus } from '@nestjs/cqrs';
import { GetUserByIdQuery } from '../../domains/user-management/queries/get-user-by-id.query';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private queryBus: QueryBus,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    try {
      console.log('JWT Strategy - Validating payload:', payload);
      
      // بررسی اینکه payload.sub یک UUID معتبر است
      if (!payload.sub || typeof payload.sub !== 'string') {
        console.log('JWT Strategy - Invalid payload.sub:', payload.sub);
        throw new UnauthorizedException('توکن نامعتبر است');
      }

      console.log('JWT Strategy - Looking for user with ID:', payload.sub);
      const user = await this.queryBus.execute(new GetUserByIdQuery({ id: payload.sub }));
      console.log('JWT Strategy - User found:', user ? 'Yes' : 'No');
      
      if (!user) {
        throw new UnauthorizedException('کاربر یافت نشد');
      }
      
      if (!user.isActive) {
        throw new UnauthorizedException('حساب کاربری غیرفعال است');
      }
      
      const userData = {
        id: user.id.value,
        email: user.email.value,
        firstName: user.name.firstName,
        lastName: user.name.lastName,
        role: user.role.value,
        isActive: user.isActive,
      };
      
      console.log('JWT Strategy - Returning user data:', userData);
      return userData;
    } catch (error) {
      console.error('JWT Strategy - Error:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('خطا در احراز هویت');
    }
  }
}
