import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

const cvReviewSchema = z.object({
  cvAssetId: z.string().optional(),
  jdAssetId: z.string().optional(),
  cvText: z.string().optional(),
  jdText: z.string().optional(),
  targetRole: z.string().default('Software Developer'),
  portfolioUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
});

@Injectable()
export class CvReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async create(studentId: string, input: unknown) {
    const body = cvReviewSchema.parse(input);
    const result = await this.ai.reviewCv(studentId, body);
    return this.prisma.cvReview.create({
      data: {
        studentId,
        cvAssetId: body.cvAssetId,
        jdAssetId: body.jdAssetId,
        cvText: body.cvText,
        portfolioUrl: body.portfolioUrl,
        githubUrl: body.githubUrl,
        overallScore: result.overallScore,
        result,
      },
    });
  }

  mine(studentId: string) {
    return this.prisma.cvReview.findMany({ where: { studentId }, orderBy: { createdAt: 'desc' } });
  }

  async detail(user: AuthUser, id: string) {
    const review = await this.prisma.cvReview.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException('CV review not found');
    }
    if (user.role === Role.STUDENT && review.studentId !== user.id) {
      throw new ForbiddenException('You cannot view this CV review');
    }
    return review;
  }
}
