import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { StorageModule } from '../storage/storage.module';
import { CvReviewController } from './cv-review.controller';
import { CvReviewService } from './cv-review.service';

@Module({
  imports: [AiModule, StorageModule],
  controllers: [CvReviewController],
  providers: [CvReviewService],
})
export class CvReviewModule {}
