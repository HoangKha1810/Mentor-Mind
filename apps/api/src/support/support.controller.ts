import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role, TicketPriority, TicketStatus } from '@prisma/client';
import { z } from 'zod';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller()
export class SupportController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('support/tickets')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    const parsed = z
      .object({
        subject: z.string().min(3),
        message: z.string().min(5),
        priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
      })
      .parse(body);
    return this.prisma.supportTicket.create({ data: { ...parsed, userId: user.id } });
  }

  @Get('support/tickets/me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.prisma.supportTicket.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Get('admin/support/tickets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminTickets() {
    return this.prisma.supportTicket.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
  }

  @Patch('admin/support/tickets/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    const parsed = z
      .object({
        status: z.nativeEnum(TicketStatus).optional(),
        priority: z.nativeEnum(TicketPriority).optional(),
        message: z.string().optional(),
      })
      .parse(body);
    return this.prisma.supportTicket.update({
      where: { id },
      data: { status: parsed.status, priority: parsed.priority, adminId: user.id },
    });
  }
}
