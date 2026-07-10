import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FileAsset, Role } from '@prisma/client';
import { readFile } from 'fs/promises';
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

  async uploadAvatar(ownerId: string, file: UploadedLocalFile) {
    if (!file?.buffer?.length) {
      throw new NotFoundException('No file uploaded');
    }
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Avatar phải là file ảnh.');
    }

    const stored = await this.storage.put({
      ownerId,
      filename: file.originalname,
      mimeType: file.mimetype,
      buffer: file.buffer,
    });
    const publicUrl = `/files/public/${stored.key}`;

    await this.prisma.fileAsset.create({
      data: {
        ownerId,
        filename: stored.filename,
        mimeType: stored.mimeType,
        size: stored.size,
        storageKey: stored.key,
        url: publicUrl,
      },
    });

    return this.prisma.user.update({
      where: { id: ownerId },
      data: { avatarUrl: publicUrl },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        status: true,
        lastLoginAt: true,
        studentProfile: true,
        mentorProfile: true,
        adminProfile: true,
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

  async getPublicAvatar(key: string) {
    const publicUrl = `/files/public/${key}`;
    const user = await this.prisma.user.findFirst({ where: { avatarUrl: publicUrl } });
    if (!user) {
      throw new NotFoundException('Avatar not found');
    }
    const asset = await this.prisma.fileAsset.findFirst({
      where: { storageKey: key, ownerId: user.id },
    });
    if (!asset) {
      throw new NotFoundException('Avatar not found');
    }
    return { asset, path: this.storage.pathForKey(asset.storageKey) };
  }

  async getOwnedAsset(ownerId: string, assetId: string) {
    const asset = await this.prisma.fileAsset.findFirst({ where: { id: assetId, ownerId } });
    if (!asset) {
      throw new NotFoundException('File not found');
    }
    return asset;
  }

  readAssetBuffer(asset: FileAsset) {
    return readFile(this.storage.pathForKey(asset.storageKey));
  }
}
