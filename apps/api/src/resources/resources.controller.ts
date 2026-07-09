import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { ResourcesService } from './resources.service';

@Controller()
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Get('resources')
  list(@Query() query: Record<string, string | undefined>) {
    return this.resources.list(query);
  }

  @Post('resources/search')
  search(@Body() body: { query: string; level?: string; goal?: string }) {
    return this.resources.search(undefined, body);
  }

  @Post('dashboard/resources/search')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  searchAsStudent(@CurrentUser() user: AuthUser, @Body() body: { query: string; level?: string; goal?: string }) {
    return this.resources.search(user.id, body);
  }

  @Post('admin/resources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  create(@Body() body: unknown) {
    return this.resources.create(body);
  }

  @Get('admin/resources')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminList(@Query() query: Record<string, string | undefined>) {
    return this.resources.adminList(query);
  }

  @Patch('admin/resources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  update(@Param('id') id: string, @Body() body: unknown) {
    return this.resources.update(id, body);
  }

  @Delete('admin/resources/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  remove(@Param('id') id: string) {
    return this.resources.remove(id);
  }
}
