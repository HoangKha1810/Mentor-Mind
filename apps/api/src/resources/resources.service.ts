import { Injectable } from '@nestjs/common';
import { Prisma, ResourceDifficulty, ResourceStatus, ResourceType } from '@prisma/client';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ExternalSearchProvider } from './external-search.provider';
import { ResourceSearchResult } from './resource-search.provider';

const resourceSchema = z.object({
  title: z.string().min(2),
  source: z.string().min(2),
  author: z.string().optional(),
  type: z.nativeEnum(ResourceType),
  url: z.string().url().optional(),
  description: z.string().min(5),
  difficulty: z.nativeEnum(ResourceDifficulty),
  category: z.string().min(2),
  tags: z.array(z.string()).default([]),
  estimatedMinutes: z.number().int().positive().default(30),
  whyRecommended: z.string().min(5),
  isCurated: z.boolean().default(true),
  status: z.nativeEnum(ResourceStatus).default(ResourceStatus.PUBLISHED),
});

@Injectable()
export class ResourcesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly external: ExternalSearchProvider,
    private readonly ai: AiService,
  ) {}

  list(query: Record<string, string | undefined>) {
    const where: Prisma.ResourceWhereInput = {
      status: ResourceStatus.PUBLISHED,
      type: query.type as never,
      difficulty: query.difficulty as never,
      category: query.category,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: 'insensitive' } },
            { description: { contains: query.search, mode: 'insensitive' } },
            { category: { contains: query.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    return this.prisma.resource.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async search(studentId: string | undefined, body: { query: string; level?: string; goal?: string }) {
    const query = body.query?.trim();
    const internal = await this.prisma.resource.findMany({
      where: {
        status: ResourceStatus.PUBLISHED,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 8,
    });
    const internalResults: ResourceSearchResult[] = internal.map((resource) => ({
      title: resource.title,
      source: resource.source,
      author: resource.author ?? undefined,
      type: resource.type,
      url: resource.url ?? undefined,
      description: resource.description,
      difficulty: resource.difficulty,
      tags: Array.isArray(resource.tags) ? resource.tags.map(String) : [],
      whyRecommended: resource.whyRecommended,
      isExternal: false,
    }));
    const [external, ai] = await Promise.all([
      this.external.search(query),
      this.ai.recommendResources(studentId, {
        query,
        level: body.level ?? 'FOUNDATION',
        goal: body.goal ?? query,
      }),
    ]);
    const results = [...internalResults, ...external, ...ai.recommendations].slice(0, 12);
    if (studentId) {
      await this.prisma.resourceSearchLog.create({ data: { studentId, query, results } });
    }
    return { query, results };
  }

  create(input: unknown) {
    const body = resourceSchema.parse(input);
    return this.prisma.resource.create({ data: { ...body, tags: body.tags } });
  }

  update(id: string, input: unknown) {
    const body = resourceSchema.partial().parse(input);
    return this.prisma.resource.update({ where: { id }, data: body });
  }

  remove(id: string) {
    return this.prisma.resource.delete({ where: { id } });
  }
}
