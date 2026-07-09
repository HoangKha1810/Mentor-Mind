import { JwtService } from '@nestjs/jwt';
import { AccountStatus, Role } from '@prisma/client';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  it('registers a student and issues tokens', async () => {
    const createdUser = {
      id: 'user_1',
      email: 'student@example.com',
      fullName: 'Student Example',
      role: Role.STUDENT,
      status: AccountStatus.ACTIVE,
      avatarUrl: null,
    };
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(createdUser),
        update: jest.fn().mockResolvedValue(createdUser),
      },
      auditLog: { create: jest.fn().mockResolvedValue({}) },
    };
    const jwt = { signAsync: jest.fn().mockResolvedValueOnce('access').mockResolvedValueOnce('refresh') };
    const config = { get: jest.fn().mockReturnValue(undefined) };
    const response = { cookie: jest.fn() };
    const service = new AuthService(prisma as never, jwt as unknown as JwtService, config as never);

    const result = await service.register(
      { email: 'student@example.com', password: 'Password123!', fullName: 'Student Example' },
      response as never,
    );

    expect(result.accessToken).toBe('access');
    expect(response.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', expect.any(Object));
    expect(prisma.user.create).toHaveBeenCalled();
  });
});
