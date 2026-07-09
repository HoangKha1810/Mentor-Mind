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

  async myBookings(user: AuthUser) {
    const where =
      user.role === Role.MENTOR ? { mentorId: user.id } : user.role === Role.STUDENT ? { studentId: user.id } : {};
    const bookings = await this.prisma.booking.findMany({ where, orderBy: { startTime: 'desc' } });
    return this.withPeople(bookings);
  }

  async mentorBookings(mentorId: string) {
    const bookings = await this.prisma.booking.findMany({ where: { mentorId }, orderBy: { startTime: 'asc' } });
    return this.withPeople(bookings);
  }

  async mentorBookingDetail(mentorId: string, id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking || booking.mentorId !== mentorId) {
      throw new NotFoundException('Booking not found');
    }
    const [withPeople] = await this.withPeople([booking]);
    const [notes, homework] = await this.prisma.$transaction([
      this.prisma.sessionNote.findMany({ where: { bookingId: id }, orderBy: { createdAt: 'desc' } }),
      this.prisma.homework.findMany({
        where: { bookingId: id },
        include: { submissions: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { booking: withPeople, notes, homework };
  }

  async mentorStudents(mentorId: string) {
    const bookings = await this.prisma.booking.findMany({ where: { mentorId }, orderBy: { startTime: 'desc' } });
    const studentIds = [...new Set(bookings.map((booking) => booking.studentId))];
    const students = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, email: true, fullName: true, avatarUrl: true, studentProfile: true, lastLoginAt: true },
      orderBy: { fullName: 'asc' },
    });
    return students.map((student) => ({
      ...student,
      bookingCount: bookings.filter((booking) => booking.studentId === student.id).length,
      latestBooking: bookings.find((booking) => booking.studentId === student.id) ?? null,
    }));
  }

  async mentorStudentDetail(mentorId: string, studentId: string) {
    const allowed = await this.prisma.booking.findFirst({ where: { mentorId, studentId } });
    if (!allowed) {
      throw new NotFoundException('Student not found');
    }
    const [student, bookings, roadmaps, homework] = await this.prisma.$transaction([
      this.prisma.user.findUnique({
        where: { id: studentId },
        select: { id: true, email: true, fullName: true, avatarUrl: true, studentProfile: true, lastLoginAt: true },
      }),
      this.prisma.booking.findMany({ where: { mentorId, studentId }, orderBy: { startTime: 'desc' } }),
      this.prisma.roadmap.findMany({
        where: { studentId, mentorId },
        include: { weeks: { orderBy: { weekNumber: 'asc' } }, items: { orderBy: { order: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.homework.findMany({
        where: { mentorId, studentId },
        include: { submissions: { orderBy: { createdAt: 'desc' } } },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    if (!student) {
      throw new NotFoundException('Student not found');
    }
    return { student, bookings: await this.withPeople(bookings), roadmaps, homework };
  }

  async mentorHomework(mentorId: string) {
    const homework = await this.prisma.homework.findMany({
      where: { mentorId },
      include: { submissions: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    const studentIds = [...new Set(homework.map((item) => item.studentId))];
    const students = await this.prisma.user.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, email: true, fullName: true, avatarUrl: true },
    });
    const studentsById = new Map(students.map((student) => [student.id, student]));
    return homework.map((item) => ({ ...item, student: studentsById.get(item.studentId) ?? null }));
  }

  async adminBookings() {
    const bookings = await this.prisma.booking.findMany({ orderBy: { startTime: 'desc' }, take: 200 });
    return this.withPeople(bookings);
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

  private async withPeople<T extends { studentId: string; mentorId: string }>(bookings: T[]) {
    const userIds = [...new Set(bookings.flatMap((booking) => [booking.studentId, booking.mentorId]))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, email: true, avatarUrl: true },
    });
    const usersById = new Map(users.map((user) => [user.id, user]));
    return bookings.map((booking) => ({
      ...booking,
      student: usersById.get(booking.studentId) ?? null,
      mentor: usersById.get(booking.mentorId) ?? null,
    }));
  }
}
