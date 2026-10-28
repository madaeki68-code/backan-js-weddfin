import { Module } from '@nestjs/common';
import { AddOnsController } from './add-ons.controller.js';
import { AddOnsService } from './add-ons.service.js';

@Module({ controllers: [AddOnsController], providers: [AddOnsService], exports: [AddOnsService] })
export class AddOnsModule {}
