import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Prisma, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import { randomInt } from 'crypto';
import { Response } from 'express';
import { z } from 'zod';
import { EmailProvider } from '../email/email-provider.interface';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_PROVIDER } from './auth.tokens';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  targetRole: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminTwoFactorSchema = z.object({
  challengeId: z.string().min(1),
  code: z.string().regex(/^\d{6}$/),
});

type TokenPayload = {
  sub: string;
  email: string;
  role: Role;
  status: AccountStatus;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  async register(input: unknown, response: Response) {
    const body = registerSchema.parse(input);
    const email = body.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await argon2.hash(body.password);
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: body.fullName,
        role: Role.STUDENT,
        status: AccountStatus.ACTIVE,
        studentProfile: {
          create: {
            targetRole: body.targetRole,
            goals: body.targetRole ? `Become job-ready for ${body.targetRole}` : undefined,
          },
        },
      },
      include: { studentProfile: true },
    });

    await this.audit(user.id, 'AUTH_REGISTER', 'User', user.id, { role: user.role });
    return this.issueTokens(user, response);
  }

  async login(input: unknown, response: Response) {
    const body = loginSchema.parse(input);
    const user = await this.prisma.user.findUnique({
      where: { email: body.email.toLowerCase() },
    });
    if (!user || !(await argon2.verify(user.passwordHash, body.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    if (user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    if (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN) {
      const challenge = await this.createAdminLoginChallenge(user);
      await this.audit(user.id, 'AUTH_ADMIN_2FA_REQUIRED', 'User', user.id, {
        challengeId: challenge.challengeId,
        emailProvider: challenge.emailProvider,
      });
      return {
        requiresTwoFactor: true,
        challengeId: challenge.challengeId,
        email: maskEmail(user.email),
        expiresAt: challenge.expiresAt.toISOString(),
      };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.audit(user.id, 'AUTH_LOGIN', 'User', user.id, {});
    return this.issueTokens(user, response);
  }

  async verifyAdminTwoFactor(input: unknown, response: Response) {
    const body = adminTwoFactorSchema.parse(input);
    const challenge = await this.prisma.adminLoginChallenge.findUnique({
      where: { id: body.challengeId },
      include: { user: true },
    });

    if (
      !challenge ||
      challenge.consumedAt ||
      challenge.expiresAt.getTime() < Date.now() ||
      challenge.attempts >= 5 ||
      challenge.user.status !== AccountStatus.ACTIVE ||
      (challenge.user.role !== Role.ADMIN && challenge.user.role !== Role.SUPER_ADMIN)
    ) {
      throw new UnauthorizedException('Mã xác thực đã hết hạn hoặc không hợp lệ');
    }

    const valid = await argon2.verify(challenge.codeHash, body.code);
    if (!valid) {
      await this.prisma.adminLoginChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Mã xác thực không đúng');
    }

    await this.prisma.adminLoginChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: new Date() },
    });
    await this.prisma.user.update({
      where: { id: challenge.userId },
      data: { lastLoginAt: new Date() },
    });
    await this.audit(challenge.userId, 'AUTH_ADMIN_2FA_VERIFY', 'User', challenge.userId, {
      challengeId: challenge.id,
    });

    return this.issueTokens(challenge.user, response);
  }

  async refresh(refreshToken: string | undefined, response: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let payload: TokenPayload;
    try {
      payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user?.refreshTokenHash || user.status !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException('Refresh session expired');
    }

    const valid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!valid) {
      throw new UnauthorizedException('Refresh token was rotated');
    }

    await this.audit(user.id, 'AUTH_REFRESH', 'User', user.id, {});
    return this.issueTokens(user, response);
  }

  async logout(refreshToken: string | undefined, response: Response) {
    if (refreshToken) {
      try {
        const payload = await this.jwt.verifyAsync<TokenPayload>(refreshToken, {
          secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
        });
        await this.prisma.user.update({
          where: { id: payload.sub },
          data: { refreshTokenHash: null },
        });
        await this.audit(payload.sub, 'AUTH_LOGOUT', 'User', payload.sub, {});
      } catch {
        // Logout should stay idempotent even for stale cookies.
      }
    }
    response.clearCookie('refreshToken', { path: '/' });
    return { loggedOut: true };
  }

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        studentProfile: true,
        mentorProfile: true,
        adminProfile: true,
      },
    });
  }

  private async issueTokens(
    user: {
      id: string;
      email: string;
      role: Role;
      status: AccountStatus;
      fullName: string;
      avatarUrl: string | null;
    },
    response: Response,
  ) {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
      expiresIn: (this.config.get<string>('ACCESS_TOKEN_TTL') ?? '15m') as never,
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      expiresIn: (this.config.get<string>('REFRESH_TOKEN_TTL') ?? '7d') as never,
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: await argon2.hash(refreshToken) },
    });

    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
      },
    };
  }

  private async createAdminLoginChallenge(user: { id: string; email: string; fullName: string }) {
    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await this.prisma.adminLoginChallenge.deleteMany({
      where: {
        userId: user.id,
        OR: [{ consumedAt: { not: null } }, { expiresAt: { lt: new Date() } }],
      },
    });

    const challenge = await this.prisma.adminLoginChallenge.create({
      data: {
        userId: user.id,
        codeHash: await argon2.hash(code),
        expiresAt,
      },
    });

    const to = this.config.get<string>('ADMIN_2FA_TO') || user.email;
    const appName = this.config.get<string>('APP_NAME') ?? 'MentorMind';
    const email = await this.emailProvider.send({
      to,
      subject: `${appName} admin login code: ${code}`,
      text: `Mã xác thực đăng nhập admin của bạn là ${code}. Mã hết hạn sau 10 phút. Nếu bạn không yêu cầu đăng nhập, hãy đổi mật khẩu ngay.`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#0f172a">
          <h2>${appName} admin login verification</h2>
          <p>Xin chào ${escapeHtml(user.fullName)},</p>
          <p>Mã xác thực đăng nhập admin của bạn là:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
          <p>Mã này hết hạn sau <strong>10 phút</strong>. Nếu bạn không yêu cầu đăng nhập, hãy đổi mật khẩu ngay.</p>
        </div>
      `,
    });

    return {
      challengeId: challenge.id,
      expiresAt,
      emailProvider: email.provider,
    };
  }

  private async audit(
    actorId: string | null,
    action: string,
    entityType: string,
    entityId: string,
    metadata: Record<string, unknown>,
  ) {
    await this.prisma.auditLog.create({
      data: { actorId, action, entityType, entityId, metadata: metadata as Prisma.InputJsonValue },
    });
  }
}

function maskEmail(email: string) {
  const [name = '', domain = ''] = email.split('@');
  const visible = name.slice(0, 2);
  return `${visible}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
