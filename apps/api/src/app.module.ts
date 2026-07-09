import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { BookingsModule } from './bookings/bookings.module';
import { CodeModule } from './code/code.module';
import { CvReviewModule } from './cv-review/cv-review.module';
import { InterviewModule } from './interview/interview.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PackagesModule } from './packages/packages.module';
import { PaymentsModule } from './payments/payments.module';
import { PrismaModule } from './prisma/prisma.module';
import { ResourcesModule } from './resources/resources.module';
import { RoadmapsModule } from './roadmaps/roadmaps.module';
import { SupportModule } from './support/support.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AuthModule,
    UsersModule,
    PackagesModule,
    PaymentsModule,
    RoadmapsModule,
    AiModule,
    BookingsModule,
    CodeModule,
    InterviewModule,
    ResourcesModule,
    CvReviewModule,
    NotificationsModule,
    StorageModule,
    SupportModule,
    AdminModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
