import { Module } from '@nestjs/common';
import { StorageController, PublicStorageController } from './storage.controller.js';
import { StorageService } from './storage.service.js';

@Module({ controllers: [StorageController, PublicStorageController], providers: [StorageService], exports: [StorageService] })
export class StorageModule {}
