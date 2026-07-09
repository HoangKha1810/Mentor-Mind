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
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  upload(@CurrentUser() user: AuthUser, @UploadedFile() file: UploadedLocalFile) {
    return this.storage.upload(user.id, file);
  }

  @Get('me')
  mine(@CurrentUser() user: AuthUser) {
    return this.storage.list(user.id);
  }

  @Get(':ownerId/:filename/download')
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
