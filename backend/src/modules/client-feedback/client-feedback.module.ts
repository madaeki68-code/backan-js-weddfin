import { Module } from '@nestjs/common';
import { ClientFeedbackController } from './client-feedback.controller.js';
import { ClientFeedbackService } from './client-feedback.service.js';

@Module({ controllers: [ClientFeedbackController], providers: [ClientFeedbackService], exports: [ClientFeedbackService] })
export class ClientFeedbackModule {}
