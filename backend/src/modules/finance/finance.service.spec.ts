import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FinanceService } from './finance.service.js';

describe('FinanceService transaction integrity', () => {
  const tx = {
    project: { findFirst: vi.fn() },
    pocket: { findFirst: vi.fn() },
    card: { findFirst: vi.fn(), update: vi.fn() },
    transaction: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
  };
  const prisma = { $transaction: vi.fn() };
  const service = new FinanceService(prisma as never);
  const expense = { date: '2026-10-28', description: 'Biaya produksi', amount: 40, type: 'Pengeluaran', cardId: 'card-1' } as const;

  beforeEach(() => {
    vi.clearAllMocks();
    prisma.$transaction.mockImplementation(async (callback: (client: typeof tx) => unknown) => callback(tx));
    tx.card.findFirst.mockResolvedValue({ currentBalance: 100 });
    tx.transaction.create.mockResolvedValue({
      type: 'expense', transactionDate: new Date('2026-10-28T00:00:00Z'), amount: 40, proofImageUrl: null,
    });
  });

  it('updates card balance and creates an expense in one database transaction', async () => {
    await service.createTransaction('profile-1', expense);
    expect(tx.card.update).toHaveBeenCalledWith({ where: { id: 'card-1' }, data: { currentBalance: { increment: -40 } } });
    expect(tx.transaction.create).toHaveBeenCalledWith({ data: expect.objectContaining({ profileId: 'profile-1', type: 'expense', amount: 40 }) });
  });

  it('rejects an expense that would overdraw a card without writing a transaction', async () => {
    tx.card.findFirst.mockResolvedValue({ currentBalance: 5 });
    await expect(service.createTransaction('profile-1', expense)).rejects.toMatchObject({ status: 400 });
    expect(tx.card.update).not.toHaveBeenCalled();
    expect(tx.transaction.create).not.toHaveBeenCalled();
  });

  it('creates a batch of transactions in one atomic operation and updates card balances', async () => {
    tx.transaction.create.mockResolvedValue({
      type: 'income', transactionDate: new Date('2026-10-28T00:00:00Z'), amount: 20, proofImageUrl: null,
    });
    const result = await service.createTransactions('profile-1', [
      { ...expense, type: 'Pengeluaran' },
      { ...expense, amount: 20, type: 'Pemasukan' },
    ]);
    expect(result).toHaveLength(2);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.transaction.create).toHaveBeenCalledTimes(2);
    expect(tx.card.update).toHaveBeenCalledTimes(2);
  });
});
