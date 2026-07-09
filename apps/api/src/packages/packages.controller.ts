import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PackagesService } from './packages.service';

@Controller()
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Get('packages')
  list(@Query() query: Record<string, string | undefined>) {
    return this.packagesService.list(query);
  }

  @Get('packages/:slug')
  detail(@Param('slug') slug: string) {
    return this.packagesService.detail(slug);
  }

  @Get('admin/packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminList(@Query() query: Record<string, string | undefined>) {
    return this.packagesService.list(query, true);
  }

  @Get('admin/packages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminDetail(@Param('id') id: string) {
    return this.packagesService.detailById(id);
  }

  @Post('packages/:id/request-consultation')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  requestConsultation(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    return this.packagesService.requestConsultation(user.id, id, body);
  }

  @Post('admin/packages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.packagesService.create(user.id, body);
  }

  @Patch('admin/packages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.packagesService.update(user.id, id, body);
  }

  @Delete('admin/packages/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.packagesService.remove(user.id, id);
  }
}
