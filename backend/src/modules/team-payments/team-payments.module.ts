import { Module } from '@nestjs/common';
import { TeamProjectPaymentsController, TeamPaymentRecordsController } from './team-payments.controller.js';
import { TeamPaymentsService } from './team-payments.service.js';

@Module({ controllers: [TeamProjectPaymentsController, TeamPaymentRecordsController], providers: [TeamPaymentsService], exports: [TeamPaymentsService] })
export class TeamPaymentsModule {}
