import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from './ai.service';
import { AIUsageService } from './ai-usage.service';

@Controller()
export class AiController {
  constructor(
    private readonly ai: AiService,
    private readonly usage: AIUsageService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('ai/chat')
  @UseGuards(JwtAuthGuard)
  chat(
    @CurrentUser() user: AuthUser,
    @Body() body: { message: string; conversationId?: string; clientContext?: unknown },
  ) {
    return this.ai.chat(user.id, body.message, body.conversationId, body.clientContext);
  }

  @Get('ai/chat/conversations')
  @UseGuards(JwtAuthGuard)
  conversations(@CurrentUser() user: AuthUser) {
    return this.prisma.aIConversation.findMany({
      where: { userId: user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  @Get('ai/chat/conversations/:id')
  @UseGuards(JwtAuthGuard)
  conversation(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.prisma.aIConversation.findFirst({
      where: { id, userId: user.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }

  @Get('admin/ai/prompt-templates')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  promptTemplates() {
    return this.ai.listPromptTemplates();
  }

  @Patch('admin/ai/prompt-templates/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updatePrompt(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() body: Record<string, unknown>,
  ) {
    return this.ai.updatePromptTemplate(user.id, id, body);
  }

  @Post('admin/ai/prompt-templates/:id/test')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  testPrompt(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.ai.testPrompt(id, body);
  }

  @Get('admin/ai/usage')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  aiUsage() {
    return this.usage.summarize();
  }

  @Get('admin/ai/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  settings() {
    return this.ai.settings();
  }

  @Patch('admin/ai/settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  updateSettings(@Body() body: Record<string, unknown>) {
    return this.ai.updateSettings(body);
  }
}
