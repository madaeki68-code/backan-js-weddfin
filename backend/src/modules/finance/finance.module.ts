import { Module } from '@nestjs/common';
import { CardsController, PocketsController, TransactionsController } from './finance.controller.js';
import { FinanceService } from './finance.service.js';

@Module({ controllers: [CardsController, PocketsController, TransactionsController], providers: [FinanceService], exports: [FinanceService] })
export class FinanceModule {}
