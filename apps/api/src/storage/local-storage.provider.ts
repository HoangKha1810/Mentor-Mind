import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { mkdir, rm, writeFile } from 'fs/promises';
import { isAbsolute, join, normalize, resolve, sep } from 'path';
import { StoredFile, StorageProvider } from './storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  readonly name = 'local';
  private readonly root: string;

  constructor(config: ConfigService) {
    const uploadDir = config.get<string>('LOCAL_UPLOAD_DIR') || 'uploads';
    this.root = isAbsolute(uploadDir) ? uploadDir : resolve(process.cwd(), uploadDir);
  }

  async put(input: { ownerId: string; filename: string; mimeType: string; buffer: Buffer }): Promise<StoredFile> {
    const ownerFolder = input.ownerId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const ownerRoot = join(this.root, ownerFolder);
    await mkdir(ownerRoot, { recursive: true });
    const safeName = input.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    const key = `${ownerFolder}/${randomUUID()}-${safeName}`;
    await writeFile(this.pathForKey(key), input.buffer);
    return {
      key,
      url: `/uploads/${key}`,
      size: input.buffer.length,
      mimeType: input.mimeType,
      filename: input.filename,
    };
  }

  async signedUrl(key: string): Promise<string> {
    return `/uploads/${key}`;
  }

  async remove(key: string): Promise<void> {
    await rm(this.pathForKey(key), { force: true });
  }

  pathForKey(key: string): string {
    const path = normalize(join(this.root, key));
    const normalizedRoot = normalize(this.root);
    if (path !== normalizedRoot && !path.startsWith(`${normalizedRoot}${sep}`)) {
      throw new Error('Invalid storage key');
    }
    return path;
  }
}
