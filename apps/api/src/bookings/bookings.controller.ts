import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { BookingsService } from './bookings.service';

@Controller()
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get('mentors')
  mentors() {
    return this.bookings.mentors();
  }

  @Get('mentors/me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  myAvailability(@CurrentUser() user: AuthUser) {
    return this.bookings.availability(user.id);
  }

  @Get('mentors/:id/availability')
  mentorAvailability(@Param('id') id: string) {
    return this.bookings.availability(id);
  }

  @Post('mentors/me/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  setAvailability(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.bookings.setAvailability(user.id, body);
  }

  @Post('bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  createBooking(@CurrentUser() user: AuthUser, @Body() body: unknown) {
    return this.bookings.createBooking(user.id, body);
  }

  @Get('bookings/me')
  @UseGuards(JwtAuthGuard)
  myBookings(@CurrentUser() user: AuthUser) {
    return this.bookings.myBookings(user);
  }

  @Get('mentor/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  mentorBookings(@CurrentUser() user: AuthUser) {
    return this.bookings.mentorBookings(user.id);
  }

  @Get('mentor/bookings/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  mentorBookingDetail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bookings.mentorBookingDetail(user.id, id);
  }

  @Get('mentor/students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  mentorStudents(@CurrentUser() user: AuthUser) {
    return this.bookings.mentorStudents(user.id);
  }

  @Get('mentor/students/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  mentorStudentDetail(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.bookings.mentorStudentDetail(user.id, id);
  }

  @Get('mentor/homework')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR)
  mentorHomework(@CurrentUser() user: AuthUser) {
    return this.bookings.mentorHomework(user.id);
  }

  @Get('admin/bookings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.SUPER_ADMIN)
  adminBookings() {
    return this.bookings.adminBookings();
  }

  @Patch('bookings/:id/status')
  @UseGuards(JwtAuthGuard)
  updateStatus(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.bookings.updateStatus(user, id, body);
  }

  @Post('sessions/:id/notes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  sessionNotes(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.bookings.addSessionNote(user.id, id, body);
  }

  @Post('sessions/:id/homework')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  addHomework(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.bookings.addHomework(user.id, id, body);
  }

  @Post('homework/:id/submit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.STUDENT)
  submitHomework(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() body: unknown) {
    return this.bookings.submitHomework(user.id, id, body);
  }

  @Post('homework-submissions/:id/review')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MENTOR, Role.ADMIN, Role.SUPER_ADMIN)
  reviewHomework(@Param('id') id: string, @Body() body: unknown) {
    return this.bookings.reviewHomework(id, body);
  }
}
