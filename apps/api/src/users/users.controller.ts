import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('users/me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.usersService.updateMe(user.id, body);
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminUsers(@Query() query: Record<string, string | undefined>) {
    return this.usersService.adminList(query);
  }

  @Patch('admin/users/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateStatus(@CurrentUser() actor: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.usersService.updateStatus(actor.id, id, body);
  }
}
