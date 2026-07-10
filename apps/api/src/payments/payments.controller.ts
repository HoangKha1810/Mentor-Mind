import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

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

  @Post('payos/webhook')
  payOsWebhook(@Body() body: unknown) {
    return this.payments.handleWebhook(body);
  }
}
