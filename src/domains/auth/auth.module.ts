import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from '../../shared/strategies/jwt.strategy';
import { DatabaseModule } from '../../shared/infrastructure/database/database.module';
import { NotificationModule } from '../notification/notification.module';
import { EmailModule } from '../../shared/infrastructure/email/email.module';
import { UserCqrsModule } from '../user-management/cqrs/user-cqrs.module';
@Module({
  imports: [
    PassportModule,
    CqrsModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '7d'),
        },
      }),
      inject: [ConfigService],
    }),
    DatabaseModule,
    NotificationModule,
    EmailModule,
    UserCqrsModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
