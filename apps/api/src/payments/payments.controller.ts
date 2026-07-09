import { Body, Controller, Post, UseGuards } from '@nestjs/common';
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

  @Post('payos/webhook')
  payOsWebhook(@Body() body: unknown) {
    return this.payments.handleWebhook(body);
  }
}
