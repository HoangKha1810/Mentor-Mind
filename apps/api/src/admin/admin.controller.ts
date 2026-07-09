import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async overview() {
    const [
      users,
      pendingRoadmapRequests,
      activeStudents,
      activeMentors,
      bookingsThisWeek,
      codingSubmissions,
      packages,
      revenue,
      supportTickets,
      aiLogs,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.roadmapRequest.count({ where: { status: 'PENDING_ADMIN_REVIEW' } }),
      this.prisma.user.count({ where: { role: 'STUDENT', status: 'ACTIVE' } }),
      this.prisma.user.count({ where: { role: 'MENTOR', status: 'ACTIVE' } }),
      this.prisma.booking.count({
        where: { startTime: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
      this.prisma.codeSubmission.count(),
      this.prisma.tutoringPackage.findMany({ where: { status: 'PUBLISHED' }, take: 5 }),
      this.prisma.payment.aggregate({ _sum: { amount: true }, where: { status: 'PAID' } }),
      this.prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      this.prisma.aIUsageLog.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    ]);

    return {
      users,
      pendingRoadmapRequests,
      activeStudents,
      activeMentors,
      bookingsThisWeek,
      codingSubmissions,
      popularPackages: packages,
      revenue: Number(revenue._sum.amount ?? 0),
      supportTickets,
      aiLogs,
      conversionFunnel: {
        visitor: 12800,
        register: activeStudents + 120,
        roadmapRequest: pendingRoadmapRequests + 32,
        consultation: bookingsThisWeek + 18,
        activePlan: activeStudents,
      },
    };
  }

  @Get('mentors')
  mentors() {
    return this.prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: { id: true, email: true, fullName: true, status: true, mentorProfile: true },
      orderBy: { fullName: 'asc' },
    });
  }

  @Get('payments')
  payments() {
    return this.prisma.payment.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Get('audit-logs')
  auditLogs(@Query('limit') limit?: string) {
    return this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(Number(limit ?? 100), 1), 500),
    });
  }
}
