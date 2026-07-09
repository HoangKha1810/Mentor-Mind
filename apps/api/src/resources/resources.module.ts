import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { ExternalSearchProvider } from './external-search.provider';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';

@Module({
  imports: [AiModule],
  controllers: [ResourcesController],
  providers: [ResourcesService, ExternalSearchProvider],
})
export class ResourcesModule {}
