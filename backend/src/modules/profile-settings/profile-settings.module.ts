import { Module } from '@nestjs/common';
import { ProfileSettingsController } from './profile-settings.controller.js';
import { ProfileSettingsService } from './profile-settings.service.js';

@Module({ controllers: [ProfileSettingsController], providers: [ProfileSettingsService], exports: [ProfileSettingsService] })
export class ProfileSettingsModule {}
