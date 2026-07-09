import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { InterviewService } from './interview.service';

@Controller()
export class InterviewController {
  constructor(private readonly interview: InterviewService) {}

  @Post('ai/interview/sessions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  createSession(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.interview.createSession(user.id, body);
  }

  @Post('ai/interview/sessions/:id/answer')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  answer(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.interview.answer(user.id, id, body);
  }

  @Post('ai/interview/sessions/:id/finish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  finish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.interview.finish(user.id, id);
  }

  @Get('ai/interview/sessions/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  mySessions(@CurrentUser() user: AuthUser) {
    return this.interview.mySessions(user.id);
  }

  @Get('ai/interview/sessions/:id')
  @UseGuards(JwtAuthGuard)
  session(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.interview.session(user, id);
  }

  @Post('ai/interview/generate-from-jd')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  generateFromJd(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.interview.generateFromJd(user.id, body);
  }

  @Get('interview-questions')
  questions(@Query() query: Record<string, string | undefined>) {
    return this.interview.questions(query);
  }

  @Post('admin/interview-questions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createQuestion(@Body() body: unknown) {
    return this.interview.createQuestion(body);
  }

  @Patch('admin/interview-questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateQuestion(@Param('id') id: string, @Body() body: unknown) {
    return this.interview.updateQuestion(id, body);
  }

  @Delete('admin/interview-questions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  deleteQuestion(@Param('id') id: string) {
    return this.interview.deleteQuestion(id);
  }
}
