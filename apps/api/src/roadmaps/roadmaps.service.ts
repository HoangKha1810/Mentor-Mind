import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoadmapItemType, RoadmapStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { AiService } from '../ai/ai.service';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

const requestSchema = z.object({
  goal: z.string().min(10),
  targetRole: z.string().min(2),
  currentLevel: z.string().min(2),
  currentSkills: z.array(z.string()).default([]),
  weakAreas: z.array(z.string()).default([]),
  deadline: z.string().datetime().optional(),
  weeklyHours: z.number().int().positive(),
  preferredSchedule: z.string().min(2),
  budgetRange: z.string().min(2),
  learningStyle: z.string().min(2),
  mentorPreference: z.string().optional(),
  wantsOneOnOneTutoring: z.boolean().default(true),
  wantsInterviewPrep: z.boolean().default(false),
  wantsCodePractice: z.boolean().default(false),
  uploadedCvAssetId: z.string().optional(),
  uploadedJdAssetId: z.string().optional(),
});

const scheduleSchema = z.object({
  mentorId: z.string(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  meetingUrl: z.string().url().optional(),
  adminNote: z.string().optional(),
});

@Injectable()
export class RoadmapsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: AiService,
  ) {}

  async createRequest(studentId: string, input: unknown) {
    const body = requestSchema.parse(input);
    const request = await this.prisma.roadmapRequest.create({
      data: {
        ...body,
        deadline: body.deadline ? new Date(body.deadline) : undefined,
        studentId,
        currentSkills: body.currentSkills,
        weakAreas: body.weakAreas,
        status: RoadmapStatus.PENDING_ADMIN_REVIEW,
      },
    });
    await this.prisma.auditLog.create({
      data: {
        actorId: studentId,
        action: 'ROADMAP_REQUEST_CREATE',
        entityType: 'RoadmapRequest',
        entityId: request.id,
        metadata: { targetRole: request.targetRole },
      },
    });
    return request;
  }

  async myRequests(studentId: string) {
    return this.prisma.roadmapRequest.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async requestDetail(user: AuthUser, id: string) {
    const request = await this.prisma.roadmapRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Roadmap request not found');
    }
    if (user.role === Role.STUDENT && request.studentId !== user.id) {
      throw new ForbiddenException('You cannot view this roadmap request');
    }
    const [aiDraft, finalRoadmap] = await Promise.all([
      request.aiDraftRoadmapId
        ? this.prisma.roadmap.findUnique({
            where: { id: request.aiDraftRoadmapId },
            include: { weeks: { orderBy: { weekNumber: 'asc' } }, items: { orderBy: { order: 'asc' } } },
          })
        : null,
      request.finalRoadmapId
        ? this.prisma.roadmap.findUnique({
            where: { id: request.finalRoadmapId },
            include: { weeks: { orderBy: { weekNumber: 'asc' } }, items: { orderBy: { order: 'asc' } } },
          })
        : null,
    ]);
    return { request, aiDraft, finalRoadmap };
  }

  async generateDraft(user: AuthUser, id: string) {
    const request = await this.prisma.roadmapRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Roadmap request not found');
    }
    if (user.role === Role.STUDENT && request.studentId !== user.id) {
      throw new ForbiddenException('You cannot generate this roadmap');
    }

    const draft = await this.ai.generateRoadmapDraft(user.id, {
      goal: request.goal,
      targetRole: request.targetRole,
      currentLevel: request.currentLevel,
      currentSkills: request.currentSkills,
      weakAreas: request.weakAreas,
      deadline: request.deadline,
      weeklyHours: request.weeklyHours,
      preferredSchedule: request.preferredSchedule,
      learningStyle: request.learningStyle,
      wantsInterviewPrep: request.wantsInterviewPrep,
      wantsCodePractice: request.wantsCodePractice,
    });

    const roadmap = await this.prisma.roadmap.create({
      data: {
        studentId: request.studentId,
        requestId: request.id,
        title: draft.title,
        summary: draft.summary,
        targetOutcome: draft.targetOutcome,
        durationWeeks: draft.durationWeeks,
        level: draft.level,
        status: RoadmapStatus.DRAFT_AI,
        aiGenerated: true,
        risks: draft.risks,
        recommendedResources: draft.recommendedResources,
        weeks: {
          create: draft.weeklyPlan.map((week) => ({
            weekNumber: week.weekNumber,
            title: week.title,
            objectives: week.objectives,
            topics: week.topics,
            practiceTasks: week.practiceTasks,
            projectTasks: week.projectTasks,
            interviewTasks: week.interviewTasks,
            recommendedSessionCount: week.recommendedSessionCount,
          })),
        },
        items: {
          create: draft.milestones.map((milestone, index) => ({
            type: RoadmapItemType.PRACTICE,
            title: milestone,
            description: `Milestone ${index + 1} for ${draft.title}`,
            order: index + 1,
          })),
        },
      },
      include: { weeks: true, items: true },
    });

    await this.prisma.roadmapRequest.update({
      where: { id },
      data: { aiDraftRoadmapId: roadmap.id, status: RoadmapStatus.PENDING_ADMIN_REVIEW },
    });

    return { draft, roadmap };
  }

  async adminRequests() {
    return this.prisma.roadmapRequest.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async adminUpdate(actorId: string, id: string, input: unknown) {
    const data = input as Prisma.RoadmapRequestUpdateInput;
    const updated = await this.prisma.roadmapRequest.update({ where: { id }, data });
    await this.audit(actorId, 'ADMIN_ROADMAP_REQUEST_UPDATE', id, data);
    return updated;
  }

  async approve(actorId: string, id: string) {
    const request = await this.prisma.roadmapRequest.findUnique({ where: { id } });
    if (!request?.aiDraftRoadmapId) {
      throw new BadRequestException('Generate or attach a roadmap draft before approval');
    }

    const roadmap = await this.prisma.roadmap.update({
      where: { id: request.aiDraftRoadmapId },
      data: {
        status: RoadmapStatus.APPROVED,
        adminApproved: true,
        adminId: actorId,
        mentorId: request.assignedMentorId,
      },
      include: { weeks: { orderBy: { weekNumber: 'asc' } }, items: { orderBy: { order: 'asc' } } },
    });

    await this.prisma.roadmapRequest.update({
      where: { id },
      data: { status: RoadmapStatus.APPROVED, finalRoadmapId: roadmap.id, assignedAdminId: actorId },
    });
    await this.prisma.notification.create({
      data: {
        userId: request.studentId,
        type: 'ROADMAP_APPROVED',
        title: 'Your roadmap is approved',
        message: 'A mentor/admin reviewed your AI draft and approved the final plan.',
        metadata: { roadmapId: roadmap.id, requestId: id },
      },
    });
    await this.audit(actorId, 'ADMIN_ROADMAP_APPROVE', id, { roadmapId: roadmap.id });
    return roadmap;
  }

  async assignMentor(actorId: string, id: string, mentorId: string) {
    const request = await this.prisma.roadmapRequest.update({
      where: { id },
      data: { assignedMentorId: mentorId },
    });
    if (request.aiDraftRoadmapId) {
      await this.prisma.roadmap.update({
        where: { id: request.aiDraftRoadmapId },
        data: { mentorId },
      });
    }
    await this.audit(actorId, 'ADMIN_ROADMAP_ASSIGN_MENTOR', id, { mentorId });
    return request;
  }

  async scheduleConsultation(actorId: string, id: string, input: unknown) {
    const body = scheduleSchema.parse(input);
    const request = await this.prisma.roadmapRequest.findUnique({ where: { id } });
    if (!request) {
      throw new NotFoundException('Roadmap request not found');
    }

    const booking = await this.prisma.booking.create({
      data: {
        studentId: request.studentId,
        mentorId: body.mentorId,
        roadmapId: request.finalRoadmapId ?? request.aiDraftRoadmapId,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
        timezone: body.timezone,
        meetingUrl: body.meetingUrl,
        adminNote: body.adminNote,
        status: 'CONFIRMED',
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: request.studentId,
        type: 'CONSULTATION_SCHEDULED',
        title: 'Consultation scheduled',
        message: 'Your roadmap consultation has been scheduled.',
        metadata: { bookingId: booking.id },
      },
    });
    await this.audit(actorId, 'ADMIN_CONSULTATION_SCHEDULE', id, { bookingId: booking.id });
    return booking;
  }

  async activate(studentId: string, id: string) {
    const roadmap = await this.prisma.roadmap.findUnique({ where: { id } });
    if (!roadmap || roadmap.studentId !== studentId) {
      throw new NotFoundException('Roadmap not found');
    }
    if (roadmap.status !== RoadmapStatus.APPROVED) {
      throw new BadRequestException('Only approved roadmaps can be activated');
    }
    return this.prisma.roadmap.update({ where: { id }, data: { status: RoadmapStatus.ACTIVE } });
  }

  private async audit(actorId: string, action: string, entityId: string, metadata: Record<string, unknown>) {
    await this.prisma.auditLog.create({
      data: { actorId, action, entityType: 'RoadmapRequest', entityId, metadata: metadata as Prisma.InputJsonValue },
    });
  }
}
