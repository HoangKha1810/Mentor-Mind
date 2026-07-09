import { Module } from '@nestjs/common';
import { LocalStorageProvider } from './local-storage.provider';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  controllers: [StorageController],
  providers: [StorageService, LocalStorageProvider],
  exports: [StorageService],
})
export class StorageModule {}
