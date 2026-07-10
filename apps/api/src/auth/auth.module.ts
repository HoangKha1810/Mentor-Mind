import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MockEmailProvider } from '../email/mock-email.provider';
import { SmtpEmailProvider } from '../email/smtp-email.provider';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { EMAIL_PROVIDER } from './auth.tokens';

@Module({
  imports: [
    ConfigModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: EMAIL_PROVIDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        config.get<string>('EMAIL_PROVIDER') === 'smtp'
          ? new SmtpEmailProvider(config)
          : new MockEmailProvider(),
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
