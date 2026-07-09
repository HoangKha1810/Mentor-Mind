import { Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  read(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date(), metadata: { readBy: user.id } },
    });
  }
}
