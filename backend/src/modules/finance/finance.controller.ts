import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import type { AuthenticatedRequest } from '../auth/authenticated-request.js';
import { FinanceService } from './finance.service.js';
import { CreateCardDto } from './dto/create-card.dto.js';
import { UpdateCardDto } from './dto/update-card.dto.js';
import { CreatePocketDto } from './dto/create-pocket.dto.js';
import { UpdatePocketDto } from './dto/update-pocket.dto.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';
import { CreateTransactionsBatchDto } from './dto/create-transactions-batch.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('cards')
export class CardsController {
  constructor(private readonly finance: FinanceService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.finance.listCards(req.user.profile?.id || req.user.id); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCardDto) { return this.finance.createCard(req.user.profile?.id || req.user.id, dto); }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateCardDto) { return this.finance.updateCard(id, req.user.profile?.id || req.user.id, dto); }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.finance.deleteCard(id, req.user.profile?.id || req.user.id); }
}

@UseGuards(JwtAuthGuard)
@Controller('pockets')
export class PocketsController {
  constructor(private readonly finance: FinanceService) {}
  @Get() list(@Req() req: AuthenticatedRequest) { return this.finance.listPockets(req.user.profile?.id || req.user.id); }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePocketDto) { return this.finance.createPocket(req.user.profile?.id || req.user.id, dto); }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdatePocketDto) { return this.finance.updatePocket(id, req.user.profile?.id || req.user.id, dto); }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.finance.deletePocket(id, req.user.profile?.id || req.user.id); }
}

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly finance: FinanceService) {}
  @Get() list(@Req() req: AuthenticatedRequest, @Query() query: Record<string, string>) {
    return this.finance.listTransactions(req.user.profile?.id || req.user.id, {
      ...query,
      page: query.page ? Number(query.page) : undefined,
      limit: query.limit ? Number(query.limit) : undefined,
      offset: query.offset ? Number(query.offset) : undefined,
    });
  }
  @Post('batch') createBatch(@Req() req: AuthenticatedRequest, @Body() dto: CreateTransactionsBatchDto) {
    return this.finance.createTransactions(req.user.profile?.id || req.user.id, dto.items);
  }
  @Post() create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTransactionDto) { return this.finance.createTransaction(req.user.profile?.id || req.user.id, dto); }
  @Patch(':id') update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateTransactionDto) { return this.finance.updateTransaction(id, req.user.profile?.id || req.user.id, dto); }
  @Delete(':id') remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) { return this.finance.deleteTransaction(id, req.user.profile?.id || req.user.id); }
}
