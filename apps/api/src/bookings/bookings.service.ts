import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, HomeworkStatus, Role } from '@prisma/client';
import { z } from 'zod';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

const availabilitySchema = z.object({
  slots: z.array(
    z.object({
      dayOfWeek: z.number().int().min(0).max(6),
      startTime: z.string(),
      endTime: z.string(),
      timezone: z.string().default('Asia/Ho_Chi_Minh'),
      isActive: z.boolean().default(true),
    }),
  ),
});

const bookingSchema = z.object({
  mentorId: z.string(),
  roadmapId: z.string().optional(),
  packageId: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  timezone: z.string().default('Asia/Ho_Chi_Minh'),
  studentNote: z.string().optional(),
});

const statusSchema = z.object({ status: z.nativeEnum(BookingStatus) });

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async mentors() {
    const mentors = await this.prisma.user.findMany({
      where: { role: Role.MENTOR, status: 'ACTIVE' },
      select: { id: true, fullName: true, avatarUrl: true, mentorProfile: true },
      orderBy: { fullName: 'asc' },
    });
    return mentors.filter((mentor) => mentor.mentorProfile?.isAvailable);
  }

  availability(mentorId: string) {
    return this.prisma.mentorAvailability.findMany({
      where: { mentorId, isActive: true },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async setAvailability(mentorId: string, input: unknown) {
    const body = availabilitySchema.parse(input);
    await this.prisma.mentorAvailability.deleteMany({ where: { mentorId } });
    return this.prisma.mentorAvailability.createManyAndReturn({
      data: body.slots.map((slot) => ({ ...slot, mentorId })),
    });
  }

  async createBooking(studentId: string, input: unknown) {
    const body = bookingSchema.parse(input);
    const startTime = new Date(body.startTime);
    const endTime = new Date(body.endTime);
    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    const booking = await this.prisma.booking.create({
      data: {
        studentId,
        mentorId: body.mentorId,
        roadmapId: body.roadmapId,
        packageId: body.packageId,
        startTime,
        endTime,
        timezone: body.timezone,
        studentNote: body.studentNote,
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: studentId,
        type: 'BOOKING_CONFIRMED',
        title: 'Booking request created',
        message: 'Your mentor booking is pending confirmation.',
        metadata: { bookingId: booking.id },
      },
    });
    return booking;
  }

  myBookings(user: AuthUser) {
    const where =
      user.role === Role.MENTOR ? { mentorId: user.id } : user.role === Role.STUDENT ? { studentId: user.id } : {};
    return this.prisma.booking.findMany({ where, orderBy: { startTime: 'desc' } });
  }

  mentorBookings(mentorId: string) {
    return this.prisma.booking.findMany({ where: { mentorId }, orderBy: { startTime: 'asc' } });
  }

  adminBookings() {
    return this.prisma.booking.findMany({ orderBy: { startTime: 'desc' }, take: 200 });
  }

  async updateStatus(user: AuthUser, id: string, input: unknown) {
    const body = statusSchema.parse(input);
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    const allowed =
      user.role === Role.ADMIN ||
      user.role === Role.SUPER_ADMIN ||
      booking.studentId === user.id ||
      booking.mentorId === user.id;
    if (!allowed) {
      throw new ForbiddenException('You cannot update this booking');
    }
    return this.prisma.booking.update({ where: { id }, data: { status: body.status } });
  }

  async addSessionNote(mentorId: string, bookingId: string, input: unknown) {
    const body = z
      .object({
        summary: z.string().min(5),
        strengths: z.array(z.string()).default([]),
        weaknesses: z.array(z.string()).default([]),
        nextSteps: z.array(z.string()).default([]),
        privateNote: z.string().optional(),
      })
      .parse(input);
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return this.prisma.sessionNote.create({
      data: {
        bookingId,
        mentorId,
        studentId: booking.studentId,
        summary: body.summary,
        strengths: body.strengths,
        weaknesses: body.weaknesses,
        nextSteps: body.nextSteps,
        privateNote: body.privateNote,
      },
    });
  }

  async addHomework(mentorId: string, bookingId: string, input: unknown) {
    const body = z
      .object({
        title: z.string().min(3),
        description: z.string().min(5),
        dueDate: z.string().datetime(),
        roadmapId: z.string().optional(),
      })
      .parse(input);
    const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    const homework = await this.prisma.homework.create({
      data: {
        bookingId,
        roadmapId: body.roadmapId ?? booking.roadmapId,
        mentorId,
        studentId: booking.studentId,
        title: body.title,
        description: body.description,
        dueDate: new Date(body.dueDate),
      },
    });
    await this.prisma.notification.create({
      data: {
        userId: booking.studentId,
        type: 'HOMEWORK_ASSIGNED',
        title: 'New homework assigned',
        message: body.title,
        metadata: { homeworkId: homework.id },
      },
    });
    return homework;
  }

  async submitHomework(studentId: string, homeworkId: string, input: unknown) {
    const body = z.object({ content: z.string().min(2), assetId: z.string().optional() }).parse(input);
    const homework = await this.prisma.homework.findUnique({ where: { id: homeworkId } });
    if (!homework || homework.studentId !== studentId) {
      throw new NotFoundException('Homework not found');
    }
    const submission = await this.prisma.homeworkSubmission.create({
      data: {
        homeworkId,
        studentId,
        content: body.content,
        assetId: body.assetId,
      },
    });
    await this.prisma.homework.update({ where: { id: homeworkId }, data: { status: HomeworkStatus.SUBMITTED } });
    return submission;
  }

  async reviewHomework(submissionId: string, input: unknown) {
    const body = z
      .object({
        mentorFeedback: z.string().min(3),
        score: z.number().int().min(0).max(100).optional(),
      })
      .parse(input);
    const submission = await this.prisma.homeworkSubmission.update({
      where: { id: submissionId },
      data: { mentorFeedback: body.mentorFeedback, score: body.score, status: HomeworkStatus.REVIEWED },
    });
    await this.prisma.homework.update({
      where: { id: submission.homeworkId },
      data: { status: HomeworkStatus.REVIEWED },
    });
    await this.prisma.notification.create({
      data: {
        userId: submission.studentId,
        type: 'HOMEWORK_REVIEWED',
        title: 'Homework reviewed',
        message: 'Your mentor left feedback on your homework.',
        metadata: { submissionId },
      },
    });
    return submission;
  }
}
