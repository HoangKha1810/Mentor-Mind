import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { AuthUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { LocalStorageProvider } from './local-storage.provider';

type UploadedLocalFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Injectable()
export class StorageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: LocalStorageProvider,
  ) {}

  async upload(ownerId: string, file: UploadedLocalFile) {
    if (!file?.buffer?.length) {
      throw new NotFoundException('No file uploaded');
    }

    const stored = await this.storage.put({
      ownerId,
      filename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });

    return this.prisma.fileAsset.create({
      data: {
        ownerId,
        filename: stored.filename,
        mimeType: stored.mimeType,
        size: stored.size,
        storageKey: stored.key,
        url: `/files/${stored.key}/download`,
      },
    });
  }

  async list(ownerId: string) {
    return this.prisma.fileAsset.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getForDownload(user: AuthUser, key: string) {
    const asset = await this.prisma.fileAsset.findFirst({ where: { storageKey: key } });
    if (!asset) {
      throw new NotFoundException('File not found');
    }
    if (asset.ownerId !== user.id && user.role !== Role.ADMIN && user.role !== Role.SUPER_ADMIN) {
      throw new ForbiddenException('You cannot download this file');
    }
    return { asset, path: this.storage.pathForKey(asset.storageKey) };
  }
}
