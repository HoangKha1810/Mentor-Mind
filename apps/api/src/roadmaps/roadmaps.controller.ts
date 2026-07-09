import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RoadmapsService } from './roadmaps.service';

@Controller()
export class RoadmapsController {
  constructor(private readonly roadmaps: RoadmapsService) {}

  @Post('roadmap-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  createRequest(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.roadmaps.createRequest(user.id, body);
  }

  @Get('roadmap-requests/me')
  @UseGuards(JwtAuthGuard)
  myRequests(@CurrentUser() user: AuthUser) {
    return this.roadmaps.myRequests(user.id);
  }

  @Get('roadmap-requests/:id')
  @UseGuards(JwtAuthGuard)
  requestDetail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roadmaps.requestDetail(user, id);
  }

  @Post('roadmap-requests/:id/generate-ai-draft')
  @UseGuards(JwtAuthGuard)
  generateDraft(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roadmaps.generateDraft(user, id);
  }

  @Get('admin/roadmap-requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminRequests() {
    return this.roadmaps.adminRequests();
  }

  @Patch('admin/roadmap-requests/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminUpdate(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.roadmaps.adminUpdate(user.id, id, body);
  }

  @Post('admin/roadmap-requests/:id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  approve(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roadmaps.approve(user.id, id);
  }

  @Post('admin/roadmap-requests/:id/assign-mentor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  assignMentor(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: { mentorId: string }) {
    return this.roadmaps.assignMentor(user.id, id, body.mentorId);
  }

  @Post('admin/roadmap-requests/:id/schedule-consultation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  scheduleConsultation(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.roadmaps.scheduleConsultation(user.id, id, body);
  }

  @Post('roadmaps/:id/activate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  activate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.roadmaps.activate(user.id, id);
  }
}
