import { Injectable } from '@nestjs/common';
import { AIUsageStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AIProvider, AIUsage } from './ai-provider.interface';

@Injectable()
export class AIUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async log(input: {
    userId?: string;
    feature: string;
    provider: AIProvider;
    usage: AIUsage;
    status: AIUsageStatus;
    errorMessage?: string;
    latencyMs: number;
  }) {
    return this.prisma.aIUsageLog.create({
      data: {
        userId: input.userId,
        feature: input.feature,
        provider: input.provider.name,
        model: input.provider.model,
        promptTokens: input.usage.promptTokens,
        completionTokens: input.usage.completionTokens,
        estimatedCost: input.provider.estimateCost(input.usage),
        status: input.status,
        errorMessage: input.errorMessage,
        latencyMs: input.latencyMs,
      },
    });
  }

  async summarize() {
    const [recent, total, failed] = await this.prisma.$transaction([
      this.prisma.aIUsageLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
      this.prisma.aIUsageLog.count(),
      this.prisma.aIUsageLog.count({ where: { status: AIUsageStatus.FAILED } }),
    ]);
    return { recent, total, failed };
  }
}
