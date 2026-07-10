import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { StorageService } from './storage.service';

type UploadedLocalFile = {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
};

@Controller('files')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(@CurrentUser() user: AuthUser, @UploadedFile() file: UploadedLocalFile) {
    return this.storage.upload(user.id, file);
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadAvatar(@CurrentUser() user: AuthUser, @UploadedFile() file: UploadedLocalFile) {
    return this.storage.uploadAvatar(user.id, file);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  mine(@CurrentUser() user: AuthUser) {
    return this.storage.list(user.id);
  }

  @Get('public/:ownerId/:filename')
  @Header('Cache-Control', 'public, max-age=86400')
  async publicAvatar(
    @Param('ownerId') ownerId: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const key = `${ownerId}/${filename}`;
    const { asset, path } = await this.storage.getPublicAvatar(key);
    response.setHeader('Content-Type', asset.mimeType);
    return response.sendFile(path);
  }

  @Get(':ownerId/:filename/download')
  @UseGuards(JwtAuthGuard)
  @Header('Cache-Control', 'private, max-age=300')
  async download(
    @CurrentUser() user: AuthUser,
    @Param('ownerId') ownerId: string,
    @Param('filename') filename: string,
    @Res() response: Response,
  ) {
    const key = `${ownerId}/${filename}`;
    const { asset, path } = await this.storage.getForDownload(user, key);
    response.setHeader('Content-Type', asset.mimeType);
    response.setHeader('Content-Disposition', `attachment; filename="${asset.filename}"`);
    return response.sendFile(path);
  }
}
