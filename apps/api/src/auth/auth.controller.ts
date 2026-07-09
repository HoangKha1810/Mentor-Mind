import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { CurrentUser, AuthUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.register(body, response);
  }

  @Post('login')
  login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(body, response);
  }

  @Post('refresh')
  refresh(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.refresh(request.cookies?.refreshToken, response);
  }

  @Post('logout')
  logout(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(request.cookies?.refreshToken, response);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.id);
  }
}
