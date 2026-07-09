import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { CvReviewController } from './cv-review.controller';
import { CvReviewService } from './cv-review.service';

@Module({
  imports: [AiModule],
  controllers: [CvReviewController],
  providers: [CvReviewService],
})
export class CvReviewModule {}
