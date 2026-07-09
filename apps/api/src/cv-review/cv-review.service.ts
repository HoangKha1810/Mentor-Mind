import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { extname } from 'path';
import { PDFParse } from 'pdf-parse';
import * as mammoth from 'mammoth';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';

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
    private readonly storage: StorageService,
  ) {}

  async create(studentId: string, input: unknown) {
    const body = cvReviewSchema.parse(input);
    const [cvTextFromFile, jdTextFromFile] = await Promise.all([
      body.cvAssetId ? this.extractAssetText(studentId, body.cvAssetId) : Promise.resolve(''),
      body.jdAssetId ? this.extractAssetText(studentId, body.jdAssetId) : Promise.resolve(''),
    ]);
    const cvText = this.compactText([body.cvText, cvTextFromFile].filter(Boolean).join('\n\n'));
    const jdText = this.compactText([body.jdText, jdTextFromFile].filter(Boolean).join('\n\n'));

    if (!cvText) {
      throw new BadRequestException('Vui lòng dán nội dung CV hoặc tải lên file CV có thể đọc được.');
    }

    const result = await this.ai.reviewCv(studentId, { ...body, cvText, jdText });
    return this.prisma.cvReview.create({
      data: {
        studentId,
        cvAssetId: body.cvAssetId,
        jdAssetId: body.jdAssetId,
        cvText,
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

  private async extractAssetText(ownerId: string, assetId: string) {
    const asset = await this.storage.getOwnedAsset(ownerId, assetId);
    const buffer = await this.storage.readAssetBuffer(asset);
    const extension = extname(asset.filename).toLowerCase();
    const mimeType = asset.mimeType.toLowerCase();

    if (mimeType.includes('pdf') || extension === '.pdf') {
      const parser = new PDFParse({ data: buffer });
      try {
        const result = await parser.getText({ first: 8 });
        return this.compactText(result.text);
      } finally {
        await parser.destroy();
      }
    }

    if (
      mimeType.includes('wordprocessingml') ||
      extension === '.docx'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      return this.compactText(result.value);
    }

    if (
      mimeType.startsWith('text/') ||
      ['.txt', '.md', '.markdown', '.rtf', '.csv'].includes(extension)
    ) {
      return this.compactText(buffer.toString('utf8'));
    }

    if (extension === '.doc' || mimeType.includes('msword')) {
      return this.compactText(buffer.toString('utf8').replace(/[^\t\n\r \x20-\x7EÀ-ỹ]+/g, ' '));
    }

    throw new BadRequestException('Định dạng file chưa hỗ trợ. Vui lòng dùng PDF, DOCX, DOC, TXT, MD hoặc RTF.');
  }

  private compactText(value: string) {
    return value.replace(/\s+/g, ' ').trim().slice(0, 24_000);
  }
}
