import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CvReviewService } from './cv-review.service';

@Controller('ai/cv-review')
export class CvReviewController {
  constructor(private readonly cvReview: CvReviewService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.cvReview.create(user.id, body);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.cvReview.mine(user.id);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  detail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.cvReview.detail(user, id);
  }
}
