import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamPaymentsService } from './team-payments.service.js';

describe('TeamPaymentsService', () => {
  const tx = {
    teamProjectPayment: { findMany: vi.fn(), update: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
  };
  const prisma = {
    project: { findFirst: vi.fn() },
    teamMember: { findFirst: vi.fn(), findMany: vi.fn() },
    teamProjectPayment: { findMany: vi.fn() },
    teamPaymentRecord: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  };
  const service = new TeamPaymentsService(prisma as never);
  beforeEach(() => {
    vi.clearAllMocks();
    prisma.project.findFirst.mockResolvedValue({ id: 'project-1' });
    prisma.teamMember.findMany.mockResolvedValue([{ id: 'member-1' }]);
    prisma.$transaction.mockImplementation((callback: (client: typeof tx) => unknown) => callback(tx));
  });

  it('retains paid rows and removes omitted unpaid rows when reconciling a project', async () => {
    tx.teamProjectPayment.findMany.mockResolvedValue([
      { id: 'paid-1', teamMemberId: 'member-1', status: 'Paid' },
      { id: 'unpaid-1', teamMemberId: 'member-2', status: 'Unpaid' },
    ]);
    tx.teamProjectPayment.update.mockImplementation(async ({ where, data }) => ({ id: where.id, ...data }));
    tx.teamProjectPayment.deleteMany.mockResolvedValue({ count: 1 });

    const result = await service.reconcile('profile-1', 'project-1', { items: [
      { id: 'paid-1', teamMemberId: 'member-1', teamMemberName: 'Ayu', date: '2026-10-28', status: 'Unpaid', fee: 250 },
    ] });

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('Paid');
    expect(tx.teamProjectPayment.deleteMany).toHaveBeenCalledWith({ where: { profileId: 'profile-1', projectId: 'project-1', id: { in: ['unpaid-1'] } } });
  });

  it('refuses payment reconciliation for projects outside the profile', async () => {
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(service.reconcile('profile-1', 'foreign-project', { items: [] })).rejects.toMatchObject({ status: 404 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a team member owned by a different profile', async () => {
    prisma.teamMember.findMany.mockResolvedValue([]);
    await expect(service.reconcile('profile-1', 'project-1', { items: [
      { teamMemberId: 'member-foreign', teamMemberName: 'Other', date: '2026-10-28', status: 'Unpaid', fee: 50 },
    ] })).rejects.toMatchObject({ status: 404 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('rejects payment records that reference another profile payment', async () => {
    prisma.teamProjectPayment.findMany.mockResolvedValue([]);
    await expect(service.createRecord('profile-1', {
      recordNumber: 'PAY-1', date: '2026-10-28', projectPaymentIds: ['7bb38526-3d5b-44c1-8ca0-bdf81ddda026'], totalAmount: 250,
    })).rejects.toMatchObject({ status: 404 });
    expect(prisma.teamPaymentRecord.create).not.toHaveBeenCalled();
  });
});
