import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { GalleriesService } from './galleries.service.js';
import { CreateGalleryDto } from './dto/create-gallery.dto.js';
import { UpdateGalleryDto } from './dto/update-gallery.dto.js';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto.js';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('galleries')
export class GalleriesController {
  constructor(private readonly service: GalleriesService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.service.findAll(req.user.profile?.id || req.user.id); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateGalleryDto) { return this.service.create(req.user.profile?.id || req.user.id, dto); }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateGalleryDto) { return this.service.update(id, req.user.profile?.id || req.user.id, dto); }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.remove(id, req.user.profile?.id || req.user.id); }
  @Post('items') createItem(@Req() req: AuthenticatedRequest, @Body() dto: CreateGalleryItemDto) { return this.service.createItem(req.user.profile?.id || req.user.id, dto); }
  @Patch('items/:id') updateItem(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateGalleryItemDto) { return this.service.updateItem(id, req.user.profile?.id || req.user.id, dto); }
  @Delete('items/:id') removeItem(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.service.removeItem(id, req.user.profile?.id || req.user.id); }
}

@Controller('public/galleries')
export class PublicGalleriesController {
  constructor(private readonly service: GalleriesService) {}
  @Get(':slug') view(@Param('slug') slug: string, @Query('code') code?: string) { return this.service.findPublic(slug, code); }
}
