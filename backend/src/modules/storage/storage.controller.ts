import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { StorageService } from './storage.service.js';

type UploadFile = { originalname: string; mimetype: string; size: number; buffer: Buffer };

@UseGuards(JwtAuthGuard)
@Controller('storage')
export class StorageController {
  constructor(private readonly storage: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024, files: 1 } }))
  upload(@Req() req: AuthenticatedRequest, @UploadedFile() file: UploadFile | undefined, @Body('folder') folder?: string) {
    if (!file) throw new BadRequestException('File wajib dipilih');
    return this.storage.upload(req.user.profile?.id || req.user.id, file, folder);
  }

  @Get('assets/:id')
  async readPrivate(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Res() response: Response) {
    const result = await this.storage.readPrivate(id, req.user.profile?.id || req.user.id);
    return serve(result, response);
  }

  @Delete('assets/:id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.storage.remove(id, req.user.profile?.id || req.user.id);
  }
}

@Controller('storage/public')
export class PublicStorageController {
  constructor(private readonly storage: StorageService) {}
  @Get(':id') async read(@Param('id') id: string, @Res() response: Response) {
    return serve(await this.storage.readPublic(id), response);
  }
}

function serve(result: Awaited<ReturnType<StorageService['readPrivate']>>, response: Response): void {
  response.setHeader('Content-Type', result.asset.mimeType);
  response.setHeader('Content-Length', String(result.buffer.length));
  response.setHeader('Content-Disposition', `inline; filename*=UTF-8''${encodeURIComponent(result.asset.originalName)}`);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Cache-Control', result.asset.isPublic ? 'public, max-age=31536000, immutable' : 'private, no-store');
  if (result.asset.mimeType === 'image/svg+xml') response.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
  response.status(200).send(result.buffer);
}
