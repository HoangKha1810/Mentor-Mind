import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomUUID } from 'crypto';
import { StoredFile, StorageProvider } from './storage-provider.interface';

@Injectable()
export class S3CompatibleStorageProvider implements StorageProvider {
  readonly name = 's3-compatible';

  constructor(private readonly config: ConfigService) {}

  async put(input: { ownerId: string; filename: string; mimeType: string; buffer: Buffer }): Promise<StoredFile> {
    const bucket = this.config.get<string>('S3_BUCKET');
    const endpoint = this.config.get<string>('S3_ENDPOINT');
    const ownerFolder = input.ownerId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const key = `${ownerFolder}/${randomUUID()}-${input.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const checksum = createHash('sha256').update(input.buffer).digest('hex');

    return {
      key,
      url: endpoint && bucket ? `${endpoint.replace(/\/$/, '')}/${bucket}/${key}` : `s3://${bucket ?? 'bucket'}/${key}`,
      size: input.buffer.length,
      mimeType: input.mimeType,
      filename: input.filename,
    };
  }

  async signedUrl(key: string): Promise<string> {
    const endpoint = this.config.get<string>('S3_ENDPOINT') ?? 'https://s3.example.com';
    const bucket = this.config.get<string>('S3_BUCKET') ?? 'mentormind';
    return `${endpoint.replace(/\/$/, '')}/${bucket}/${key}?signature=adapter-placeholder`;
  }

  async remove(_key: string): Promise<void> {
    return;
  }
}
