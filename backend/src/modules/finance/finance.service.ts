import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TransactionType } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateCardDto } from './dto/create-card.dto.js';
import { UpdateCardDto } from './dto/update-card.dto.js';
import { CreatePocketDto } from './dto/create-pocket.dto.js';
import { UpdatePocketDto } from './dto/update-pocket.dto.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';
import { UpdateTransactionDto } from './dto/update-transaction.dto.js';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  listCards(profileId: string) { return this.prisma.card.findMany({ where: { profileId }, orderBy: { createdAt: 'asc' } }).then(rows => rows.map(cardView)); }
  async createCard(profileId: string, dto: CreateCardDto) {
    const row = await this.prisma.card.create({ data: {
      profileId, name: dto.name, accountHolder: dto.cardHolderName, bankName: dto.bankName,
      accountNumber: dto.lastFourDigits, lastFourDigits: dto.lastFourDigits ?? '',
      cardHolderName: dto.cardHolderName, cardType: dto.cardType ?? 'Debit', expiryDate: dto.expiryDate,
      currentBalance: dto.balance ?? 0, colorGradient: dto.colorGradient ?? 'from-indigo-500 to-blue-500',
    } });
    return cardView(row);
  }
  async updateCard(id: string, profileId: string, dto: UpdateCardDto) {
    await this.requireCard(id, profileId);
    const row = await this.prisma.card.update({ where: { id }, data: {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.cardHolderName !== undefined && { cardHolderName: dto.cardHolderName, accountHolder: dto.cardHolderName }),
      ...(dto.bankName !== undefined && { bankName: dto.bankName }),
      ...(dto.cardType !== undefined && { cardType: dto.cardType }),
      ...(dto.lastFourDigits !== undefined && { lastFourDigits: dto.lastFourDigits, accountNumber: dto.lastFourDigits }),
      ...(dto.expiryDate !== undefined && { expiryDate: dto.expiryDate }),
      ...(dto.balance !== undefined && { currentBalance: dto.balance }),
      ...(dto.colorGradient !== undefined && { colorGradient: dto.colorGradient }),
    } });
    return cardView(row);
  }
  async deleteCard(id: string, profileId: string) {
    await this.requireCard(id, profileId);
    await this.prisma.$transaction([
      this.prisma.transaction.updateMany({ where: { cardId: id, profileId }, data: { cardId: null } }),
      this.prisma.pocket.updateMany({ where: { sourceCardId: id, profileId }, data: { sourceCardId: null } }),
      this.prisma.card.delete({ where: { id } }),
    ]);
    return { message: 'Kartu berhasil dihapus' };
  }

  listPockets(profileId: string) { return this.prisma.pocket.findMany({ where: { profileId }, orderBy: { name: 'asc' } }).then(rows => rows.map(pocketView)); }
  async createPocket(profileId: string, dto: CreatePocketDto) {
    if (dto.sourceCardId) await this.requireCard(dto.sourceCardId, profileId);
    const row = await this.prisma.pocket.create({ data: {
      profileId, name: dto.name.trim(), type: dto.type, description: dto.description ?? '', icon: dto.icon ?? 'piggy-bank',
      currentAmount: dto.amount ?? 0, goalAmount: dto.goalAmount, lockEndDate: dto.lockEndDate ? new Date(dto.lockEndDate) : undefined,
      sourceCardId: dto.sourceCardId, members: dto.members as Prisma.InputJsonValue | undefined,
    } });
    return pocketView(row);
  }
  async updatePocket(id: string, profileId: string, dto: UpdatePocketDto) {
    await this.requirePocket(id, profileId);
    if (dto.sourceCardId) await this.requireCard(dto.sourceCardId, profileId);
    const row = await this.prisma.pocket.update({ where: { id }, data: {
      ...(dto.name !== undefined && { name: dto.name.trim() }), ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.description !== undefined && { description: dto.description }), ...(dto.icon !== undefined && { icon: dto.icon }),
      ...(dto.amount !== undefined && { currentAmount: dto.amount }), ...(dto.goalAmount !== undefined && { goalAmount: dto.goalAmount }),
      ...(dto.lockEndDate !== undefined && { lockEndDate: dto.lockEndDate ? new Date(dto.lockEndDate) : null }),
      ...(dto.sourceCardId !== undefined && { sourceCardId: dto.sourceCardId || null }),
      ...(dto.members !== undefined && { members: dto.members as Prisma.InputJsonValue }),
    } });
    return pocketView(row);
  }
  async deletePocket(id: string, profileId: string) { await this.requirePocket(id, profileId); await this.prisma.pocket.delete({ where: { id } }); return { message: 'Pocket berhasil dihapus' }; }

  async listTransactions(profileId: string, query: { page?: number; limit?: number; offset?: number; search?: string; type?: string; category?: string; dateFrom?: string; dateTo?: string } = {}) {
    const page = Math.max(1, Math.floor(query.page || 1));
    const limit = [10, 20, 50, 100].includes(Number(query.limit)) ? Number(query.limit) : 10;
    const type = query.type && query.type !== 'all' ? toDbTransactionType(query.type) : undefined;
    const where = {
      profileId,
      ...(type && { type }),
      ...(query.category && { category: query.category }),
      ...((query.dateFrom || query.dateTo) && { transactionDate: {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }), ...(query.dateTo && { lte: new Date(query.dateTo) }),
      } }),
      ...(query.search?.trim() && { OR: [
        { description: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { category: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { method: { contains: query.search.trim(), mode: 'insensitive' as const } },
      ] }),
    };
    const skip = query.offset === undefined ? (page - 1) * limit : Math.max(0, Math.floor(query.offset));
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({ where, orderBy: [{ transactionDate: 'desc' }, { id: 'desc' }], skip, take: limit }),
      this.prisma.transaction.count({ where }),
    ]);
    return { transactions: rows.map(transactionView), total };
  }

  async createTransaction(profileId: string, dto: CreateTransactionDto) {
    const type = toDbTransactionType(dto.type);
    return this.prisma.$transaction(async tx => {
      if (dto.projectId && !await tx.project.findFirst({ where: { id: dto.projectId, profileId }, select: { id: true } })) {
        throw new NotFoundException('Proyek tidak ditemukan');
      }
      if (dto.pocketId) await this.requirePocket(dto.pocketId, profileId, tx);
      if (dto.cardId) await this.adjustCard(tx, dto.cardId, profileId, amountDelta(type, dto.amount));
      const row = await tx.transaction.create({ data: transactionData(profileId, dto, type) });
      return transactionView(row);
    });
  }

  async createTransactions(profileId: string, items: CreateTransactionDto[]) {
    if (!items.length || items.length > 100) throw new BadRequestException('Batch transaksi harus berisi 1–100 item');
    return this.prisma.$transaction(async tx => {
      const created = [];
      for (const dto of items) {
        const type = toDbTransactionType(dto.type);
        if (dto.projectId && !await tx.project.findFirst({ where: { id: dto.projectId, profileId }, select: { id: true } })) {
          throw new NotFoundException('Proyek tidak ditemukan');
        }
        if (dto.pocketId) await this.requirePocket(dto.pocketId, profileId, tx);
        if (dto.cardId) await this.adjustCard(tx, dto.cardId, profileId, amountDelta(type, dto.amount));
        const row = await tx.transaction.create({ data: transactionData(profileId, dto, type) });
        created.push(transactionView(row));
      }
      return created;
    });
  }

  async updateTransaction(id: string, profileId: string, dto: UpdateTransactionDto) {
    return this.prisma.$transaction(async tx => {
      const old = await tx.transaction.findFirst({ where: { id, profileId } });
      if (!old) throw new NotFoundException(`Transaksi ${id} tidak ditemukan`);
      const newType = dto.type === undefined ? old.type : toDbTransactionType(dto.type);
      const newAmount = dto.amount ?? Number(old.amount);
      const newCardId = dto.cardId === undefined ? old.cardId : dto.cardId || null;
      if (dto.projectId && !await tx.project.findFirst({ where: { id: dto.projectId, profileId }, select: { id: true } })) throw new NotFoundException('Proyek tidak ditemukan');
      if (dto.pocketId) await this.requirePocket(dto.pocketId, profileId, tx);
      if (old.cardId === newCardId) {
        const delta = -amountDelta(old.type, Number(old.amount)) + amountDelta(newType, newAmount);
        if (newCardId && delta) await this.adjustCard(tx, newCardId, profileId, delta);
      } else {
        if (old.cardId) await this.adjustCard(tx, old.cardId, profileId, -amountDelta(old.type, Number(old.amount)));
        if (newCardId) await this.adjustCard(tx, newCardId, profileId, amountDelta(newType, newAmount));
      }
      const row = await tx.transaction.update({ where: { id }, data: {
        ...(dto.date !== undefined && { transactionDate: new Date(dto.date) }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }), ...(dto.type !== undefined && { type: newType }),
        ...(dto.projectId !== undefined && { projectId: dto.projectId || null }), ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.method !== undefined && { method: dto.method }), ...(dto.pocketId !== undefined && { pocketId: dto.pocketId || null }),
        ...(dto.cardId !== undefined && { cardId: dto.cardId || null }), ...(dto.printingItemId !== undefined && { printingItemId: dto.printingItemId }),
        ...(dto.sourceId !== undefined && { sourceId: dto.sourceId }), ...(dto.clientName !== undefined && { clientName: dto.clientName }),
        ...(dto.proofUrl !== undefined && { proofImageUrl: dto.proofUrl }), ...(dto.vendorSignature !== undefined && { vendorSignature: dto.vendorSignature }),
      } });
      return transactionView(row);
    });
  }

  async deleteTransaction(id: string, profileId: string) {
    return this.prisma.$transaction(async tx => {
      const old = await tx.transaction.findFirst({ where: { id, profileId } });
      if (!old) throw new NotFoundException(`Transaksi ${id} tidak ditemukan`);
      if (old.cardId) await this.adjustCard(tx, old.cardId, profileId, -amountDelta(old.type, Number(old.amount)));
      await tx.transaction.delete({ where: { id } });
      return { message: 'Transaksi berhasil dihapus' };
    });
  }

  private async requireCard(id: string, profileId: string, tx: Prisma.TransactionClient = this.prisma) {
    const card = await tx.card.findFirst({ where: { id, profileId } });
    if (!card) throw new NotFoundException(`Kartu ${id} tidak ditemukan`);
    return card;
  }
  private async requirePocket(id: string, profileId: string, tx: Prisma.TransactionClient = this.prisma) {
    const pocket = await tx.pocket.findFirst({ where: { id, profileId } });
    if (!pocket) throw new NotFoundException(`Pocket ${id} tidak ditemukan`);
    return pocket;
  }
  private async adjustCard(tx: Prisma.TransactionClient, id: string, profileId: string, delta: number) {
    const card = await this.requireCard(id, profileId, tx);
    if (Number(card.currentBalance) + delta < 0) throw new BadRequestException('Saldo kartu tidak mencukupi');
    await tx.card.update({ where: { id }, data: { currentBalance: { increment: delta } } });
  }
}

function toDbTransactionType(type: string): TransactionType {
  if (type === 'Pemasukan' || type === 'income') return 'income';
  if (type === 'Pengeluaran' || type === 'expense') return 'expense';
  return 'transfer';
}
function amountDelta(type: TransactionType, amount: number) { return type === 'income' ? amount : type === 'expense' ? -amount : 0; }
function transactionData(profileId: string, dto: CreateTransactionDto, type: TransactionType): Prisma.TransactionUncheckedCreateInput {
  return {
    profileId, transactionDate: new Date(dto.date), description: dto.description, amount: dto.amount, type,
    projectId: dto.projectId, cardId: dto.cardId, pocketId: dto.pocketId,
    category: dto.category ?? '', method: dto.method ?? 'Tunai', printingItemId: dto.printingItemId,
    sourceId: dto.sourceId, clientName: dto.clientName, proofImageUrl: dto.proofUrl, vendorSignature: dto.vendorSignature,
  };
}
function cardView<T extends { currentBalance: Prisma.Decimal; accountHolder: string | null; accountNumber: string | null; cardHolderName: string | null; cardType: string; lastFourDigits: string; expiryDate: string | null; colorGradient: string; name: string | null }>(row: T) {
  return { ...row, balance: Number(row.currentBalance), cardHolderName: row.cardHolderName ?? row.accountHolder ?? '', cardType: row.cardType, lastFourDigits: row.lastFourDigits || row.accountNumber || '', expiryDate: row.expiryDate, colorGradient: row.colorGradient };
}
function pocketView<T extends { currentAmount: Prisma.Decimal; goalAmount: Prisma.Decimal | null }>(row: T) { return { ...row, amount: Number(row.currentAmount), goalAmount: row.goalAmount ? Number(row.goalAmount) : undefined }; }
function transactionView<T extends { type: TransactionType; transactionDate: Date; amount: Prisma.Decimal; proofImageUrl: string | null }>(row: T) {
  return { ...row, type: row.type === 'income' ? 'Pemasukan' : row.type === 'expense' ? 'Pengeluaran' : 'Transfer', date: row.transactionDate.toISOString().slice(0, 10), amount: Number(row.amount), proofUrl: row.proofImageUrl ?? undefined };
}
