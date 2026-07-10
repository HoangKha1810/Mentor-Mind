import { BadRequestException, Injectable } from '@nestjs/common';
import { AccountStatus, Prisma, Role } from '@prisma/client';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const updateMeSchema = z.object({
  fullName: z.string().min(2).optional(),
  avatarUrl: z
    .union([z.string().url(), z.string().startsWith('/')])
    .optional()
    .nullable(),
  targetRole: z.string().optional(),
  currentLevel: z.string().optional(),
  goals: z.string().optional(),
  weeklyHours: z.number().int().positive().optional(),
  learningStyle: z.string().optional(),
  budgetRange: z.string().optional(),
  expectedSalary: z.string().optional(),
  preferredLocation: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
});

const updateStatusSchema = z.object({
  status: z.nativeEnum(AccountStatus),
});

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMe(userId: string, input: unknown) {
    const body = updateMeSchema.parse(input);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const profileData = {
      targetRole: body.targetRole,
      currentLevel: body.currentLevel,
      goals: body.goals,
      weeklyHours: body.weeklyHours,
      learningStyle: body.learningStyle,
      budgetRange: body.budgetRange,
      expectedSalary: body.expectedSalary,
      preferredLocation: body.preferredLocation,
      timezone: body.timezone,
      bio: body.bio,
    };

    const cleanProfile = Object.fromEntries(
      Object.entries(profileData).filter(([, value]) => value !== undefined),
    ) as Prisma.StudentProfileUncheckedUpdateInput;

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: body.fullName,
        avatarUrl: body.avatarUrl ?? undefined,
      },
    });

    if (user.role === Role.STUDENT && Object.keys(cleanProfile).length) {
      await this.prisma.studentProfile.upsert({
        where: { userId },
        create: { userId, ...cleanProfile } as Prisma.StudentProfileUncheckedCreateInput,
        update: cleanProfile,
      });
    }

    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        studentProfile: true,
        mentorProfile: true,
        adminProfile: true,
      },
    });
  }

  async adminList(query: Record<string, string | undefined>) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);
    const where: Prisma.UserWhereInput = {
      role: query.role ? (query.role as Role) : undefined,
      status: query.status ? (query.status as AccountStatus) : undefined,
      OR: query.search
        ? [
            { email: { contains: query.search, mode: 'insensitive' } },
            { fullName: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          fullName: true,
          role: true,
          status: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, page, limit, total };
  }

  async updateStatus(actorId: string, id: string | undefined, input: unknown) {
    if (!id) {
      throw new BadRequestException('Missing user id');
    }
    const body = updateStatusSchema.parse(input);
    const updated = await this.prisma.user.update({
      where: { id },
      data: { status: body.status },
      select: { id: true, email: true, status: true, role: true },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action: 'ADMIN_USER_STATUS_UPDATE',
        entityType: 'User',
        entityId: id,
        metadata: { status: body.status },
      },
    });
    return updated;
  }
}
