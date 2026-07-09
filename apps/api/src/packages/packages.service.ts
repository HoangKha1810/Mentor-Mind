import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PackageCategory, PackageLevel, PackageStatus, Prisma } from '@prisma/client';
import { slugify } from '@mentormind/shared';
import { z } from 'zod';
import { PrismaService } from '../prisma/prisma.service';

const packageSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  shortDescription: z.string().min(10),
  longDescription: z.string().min(20),
  targetAudience: z.string().min(3),
  targetRole: z.string().min(2),
  level: z.nativeEnum(PackageLevel),
  category: z.nativeEnum(PackageCategory),
  durationWeeks: z.number().int().positive(),
  recommendedSessions: z.number().int().positive(),
  sessionDurationMinutes: z.number().int().positive(),
  outcomes: z.array(z.string()).min(1),
  skills: z.array(z.string()).min(1),
  includedAiTools: z.array(z.string()).min(1),
  mentorType: z.string().min(2),
  price: z.number().nonnegative(),
  currency: z.string().default('USD'),
  status: z.nativeEnum(PackageStatus).default(PackageStatus.DRAFT),
  featured: z.boolean().default(false),
  heroConfig: z.record(z.unknown()).default({ accent: 'blue' }),
});

const consultationSchema = z.object({
  message: z.string().min(5).max(2000),
});

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: Record<string, string | undefined>) {
    const page = Math.max(Number(query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(query.limit ?? 12), 1), 50);
    const where: Prisma.TutoringPackageWhereInput = {
      status: query.includeDrafts === 'true' ? undefined : PackageStatus.PUBLISHED,
      category: query.category ? (query.category as PackageCategory) : undefined,
      level: query.level ? (query.level as PackageLevel) : undefined,
      featured: query.featured === 'true' ? true : undefined,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: 'insensitive' } },
            { targetRole: { contains: query.search, mode: 'insensitive' } },
            { shortDescription: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tutoringPackage.findMany({
        where,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.tutoringPackage.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async detail(slug: string) {
    const item = await this.prisma.tutoringPackage.findUnique({ where: { slug } });
    if (!item || item.status === PackageStatus.ARCHIVED) {
      throw new NotFoundException('Package not found');
    }
    const related = await this.prisma.tutoringPackage.findMany({
      where: {
        id: { not: item.id },
        category: item.category,
        status: PackageStatus.PUBLISHED,
      },
      take: 3,
      orderBy: { featured: 'desc' },
    });
    return { ...item, related };
  }

  async requestConsultation(studentId: string, packageId: string, input: unknown) {
    const body = consultationSchema.parse(input);
    const pack = await this.prisma.tutoringPackage.findUnique({ where: { id: packageId } });
    if (!pack || pack.status !== PackageStatus.PUBLISHED) {
      throw new BadRequestException('Package is not available for consultation');
    }

    const request = await this.prisma.packageConsultationRequest.create({
      data: { studentId, packageId, message: body.message },
    });
    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'CONSULTATION_SCHEDULED',
        title: 'Consultation request received',
        message: `Our team will review your request for ${pack.title}.`,
        metadata: { packageId },
      },
    });
    return request;
  }

  async create(actorId: string, input: unknown) {
    const body = packageSchema.parse(input);
    const created = await this.prisma.tutoringPackage.create({
      data: {
        ...body,
        slug: body.slug ?? slugify(body.title),
        outcomes: body.outcomes as Prisma.InputJsonValue,
        skills: body.skills as Prisma.InputJsonValue,
        includedAiTools: body.includedAiTools as Prisma.InputJsonValue,
        heroConfig: body.heroConfig as Prisma.InputJsonValue,
      },
    });
    await this.audit(actorId, 'ADMIN_PACKAGE_CREATE', created.id);
    return created;
  }

  async update(actorId: string, id: string, input: unknown) {
    const body = packageSchema.partial().parse(input);
    const data: Prisma.TutoringPackageUpdateInput = {
      ...body,
      slug: body.slug ?? (body.title ? slugify(body.title) : undefined),
      outcomes: body.outcomes as Prisma.InputJsonValue | undefined,
      skills: body.skills as Prisma.InputJsonValue | undefined,
      includedAiTools: body.includedAiTools as Prisma.InputJsonValue | undefined,
      heroConfig: body.heroConfig as Prisma.InputJsonValue | undefined,
    };
    const updated = await this.prisma.tutoringPackage.update({
      where: { id },
      data,
    });
    await this.audit(actorId, 'ADMIN_PACKAGE_UPDATE', id);
    return updated;
  }

  async remove(actorId: string, id: string) {
    const removed = await this.prisma.tutoringPackage.delete({ where: { id } });
    await this.audit(actorId, 'ADMIN_PACKAGE_DELETE', id);
    return removed;
  }

  private async audit(actorId: string, action: string, entityId: string) {
    await this.prisma.auditLog.create({
      data: { actorId, action, entityType: 'TutoringPackage', entityId, metadata: {} },
    });
  }
}
