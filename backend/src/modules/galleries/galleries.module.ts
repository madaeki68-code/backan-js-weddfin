import { Module } from '@nestjs/common';
import { GalleriesController, PublicGalleriesController } from './galleries.controller.js';
import { GalleriesService } from './galleries.service.js';

@Module({ controllers: [GalleriesController, PublicGalleriesController], providers: [GalleriesService], exports: [GalleriesService] })
export class GalleriesModule {}
