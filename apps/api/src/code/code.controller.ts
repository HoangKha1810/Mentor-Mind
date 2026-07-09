import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CodeService } from './code.service';

@Controller()
export class CodeController {
  constructor(private readonly code: CodeService) {}

  @Get('code/problems')
  problems(@Query() query: Record<string, string | undefined>) {
    return this.code.problems(query);
  }

  @Get('code/problems/:slug')
  problem(@Param('slug') slug: string) {
    return this.code.problem(slug);
  }

  @Post('code/problems/:id/run')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  run(@Param('id') id: string, @Body() body: unknown) {
    return this.code.run(id, body, false);
  }

  @Post('code/problems/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  submit(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.code.submit(user.id, id, body);
  }

  @Get('code/submissions/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  submissions(@CurrentUser() user: AuthUser) {
    return this.code.submissions(user.id);
  }

  @Get('code/submissions/:id')
  @UseGuards(JwtAuthGuard)
  submission(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.code.submission(user, id);
  }

  @Post('code/problems/:id/ai-hint')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  hint(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.code.hint(user.id, id, body);
  }

  @Post('code/submissions/:id/ai-review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  review(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.code.review(user.id, id);
  }

  @Post('admin/code/problems')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  createProblem(@Body() body: unknown) {
    return this.code.createProblem(body);
  }

  @Get('admin/code/problems')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminProblems(@Query() query: Record<string, string | undefined>) {
    return this.code.adminProblems(query);
  }

  @Get('admin/code/problems/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminProblem(@Param('id') id: string) {
    return this.code.adminProblem(id);
  }

  @Patch('admin/code/problems/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateProblem(@Param('id') id: string, @Body() body: unknown) {
    return this.code.updateProblem(id, body);
  }

  @Delete('admin/code/problems/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  deleteProblem(@Param('id') id: string) {
    return this.code.deleteProblem(id);
  }
}
