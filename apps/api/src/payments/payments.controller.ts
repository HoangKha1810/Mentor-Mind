import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Get('plans')
  plans() {
    return this.payments.plans();
  }

  @Post('payos/create-link')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  createPayOsLink(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.payments.createPaymentLink(user.id, body);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  wallet(@CurrentUser() user: AuthUser) {
    return this.payments.wallet(user.id);
  }

  @Get('entitlements')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  entitlements(@CurrentUser() user: AuthUser) {
    return this.payments.entitlementsSummary(user.id);
  }

  @Post('wallet/top-up')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  topUp(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.payments.createTopUpLink(user.id, body);
  }

  @Post('wallet/purchase-package')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  purchasePackage(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.payments.purchasePackage(user.id, body);
  }

  @Post('subscriptions/:slug/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  purchaseSubscription(@CurrentUser() user: AuthUser, @Param('slug') slug: string) {
    return this.payments.purchaseSubscription(user.id, slug);
  }

  @Post('payos/webhook')
  payOsWebhook(@Body() body: unknown) {
    return this.payments.handleWebhook(body);
  }
}
