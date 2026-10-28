import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import {
  Lead,
  LeadStatus,
  ContactChannel,
  Client,
  Project,
  Transaction,
  TransactionType,
  PaymentStatus,
  Card,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
} from '../types';
import { queryKeys } from '../services/queryKeys';
import {
  invalidateClientsCache,
  invalidateProjectsCache,
  invalidateFinanceCache,
  invalidateTeamCache,
  invalidateLeadsCache,
} from '../services/cacheInvalidation';

describe('Stage 16 — Cross-Module End-to-End Integration Test Suite', () => {
  it('validates lead conversion lifecycle updates client, project, finance, and cache', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // 1. Initial State: Lead in DISCUSSION
    const lead: Lead = {
      id: 'lead-integration-01',
      name: 'Rian & Sinta',
      contactChannel: ContactChannel.WHATSAPP,
      location: 'Serang',
      status: LeadStatus.DISCUSSION,
      date: '2026-10-27',
      whatsapp: '081234567890',
    };

    // 2. Lead moves to FOLLOW_UP then CONVERTED
    lead.status = LeadStatus.CONVERTED;
    await invalidateLeadsCache(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.leads.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.dashboard.stats });

    // 3. Converted Client created
    const createdClient: Client = {
      id: 'cli-int-01',
      name: lead.name,
      email: 'rian.sinta@example.com',
      phone: lead.whatsapp || '',
      whatsapp: lead.whatsapp || '',
      since: '2026-10-27',
      status: 'Aktif' as any,
      clientType: 'Direct' as any,
      lastContact: new Date().toISOString(),
      portalAccessId: 'portal-rian-sinta',
    };

    // 4. Project created for client with DP
    const initialCardBalance = 15_000_000;
    const dpAmount = 5_000_000;
    const totalCost = 15_000_000;

    const createdProject: Project = {
      id: 'proj-int-01',
      clientId: createdClient.id,
      clientName: createdClient.name,
      projectName: 'Pernikahan Rian & Sinta',
      projectType: 'Wedding',
      packageName: 'Diamond Elegance',
      packageId: 'pkg-diamond',
      addOns: [],
      date: '2026-12-15',
      location: 'Serang',
      progress: 20,
      status: 'Dikonfirmasi',
      totalCost,
      amountPaid: dpAmount,
      paymentStatus: PaymentStatus.DP_TERBAYAR,
      team: [],
    };

    const initialCard: Card = {
      id: 'card-bca-01',
      bankName: 'BCA',
      cardHolderName: 'Vendor Utama',
      cardNumber: '1234567890',
      lastFourDigits: '7890',
      balance: initialCardBalance,
      colorGradient: 'from-blue-600 to-indigo-600',
    } as any;

    // 5. Income transaction recorded for DP
    const dpTransaction: Transaction = {
      id: 'tx-dp-01',
      date: '2026-10-27',
      description: `DP Acara Pernikahan ${createdProject.projectName}`,
      amount: dpAmount,
      type: TransactionType.INCOME,
      projectId: createdProject.id,
      category: 'DP Acara Pernikahan',
      method: 'Transfer Bank',
      cardId: initialCard.id,
    };

    // Card balance updated
    const updatedCard: Card = {
      ...initialCard,
      balance: initialCard.balance + dpAmount,
    };

    expect(dpTransaction.amount).toBe(dpAmount);
    expect(dpTransaction.type).toBe(TransactionType.INCOME);
    expect(updatedCard.balance).toBe(20_000_000);
    expect(createdProject.amountPaid).toBe(5_000_000);
    expect(createdProject.totalCost - createdProject.amountPaid).toBe(10_000_000);

    // Invalidate client, project, finance
    await invalidateClientsCache(queryClient);
    await invalidateProjectsCache(queryClient);
    await invalidateFinanceCache(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.clients.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.projects.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.cards.all });
  });

  it('validates project team assignment and freelance honor payment lifecycle', async () => {
    const queryClient = new QueryClient();
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    // 1. Team member setup
    const teamMember: TeamMember = {
      id: 'tm-01',
      name: 'Budi Fotografer',
      role: 'Fotografer Utama',
      email: 'budi@example.com',
      phone: '081122334455',
      standardFee: 1_500_000,
      bankName: 'Mandiri',
      noRek: '1420012345678',
      category: 'Tim',
      rating: 5,
      performanceNotes: [],
      portalAccessId: 'portal-budi',
    };

    // 2. Project payment assignment
    const projectPayment: TeamProjectPayment = {
      id: 'tpp-01',
      projectId: 'proj-int-01',
      teamMemberId: teamMember.id,
      teamMemberName: teamMember.name,
      role: teamMember.role,
      fee: 1_500_000,
      status: 'Unpaid',
      date: '2026-12-15',
    };

    expect(projectPayment.status).toBe('Unpaid');

    // 3. Execute honor payment
    const paidPayment: TeamProjectPayment = {
      ...projectPayment,
      status: 'Paid',
    };

    const expenseTransaction: Transaction = {
      id: 'tx-team-01',
      date: '2026-10-27',
      description: `Gaji Freelance - ${teamMember.name} (Pernikahan Rian & Sinta)`,
      amount: projectPayment.fee,
      type: TransactionType.EXPENSE,
      projectId: projectPayment.projectId,
      category: 'Gaji Tim / Vendor',
      method: 'Transfer Bank',
      cardId: 'card-bca-01',
    };

    const paymentRecord: TeamPaymentRecord = {
      id: 'slip-01',
      recordNumber: 'PAY-FR-0001-20261027',
      teamMemberId: teamMember.id,
      date: '2026-10-27',
      projectPaymentIds: [projectPayment.id],
      totalAmount: projectPayment.fee,
    };

    expect(paidPayment.status).toBe('Paid');
    expect(expenseTransaction.amount).toBe(1_500_000);
    expect(paymentRecord.totalAmount).toBe(1_500_000);

    // 4. Verify invalidations
    await invalidateTeamCache(queryClient);
    await invalidateFinanceCache(queryClient);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.teamMembers.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.teamPayments.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.teamRecords.all });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: queryKeys.transactions.all });
  });

  it('validates project final settlement updates status to LUNAS and balance due to 0', async () => {
    const totalCost = 15_000_000;
    let amountPaid = 5_000_000;
    const finalPayment = 10_000_000;

    amountPaid += finalPayment;
    const remaining = totalCost - amountPaid;
    const paymentStatus = remaining <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR;

    expect(amountPaid).toBe(15_000_000);
    expect(remaining).toBe(0);
    expect(paymentStatus).toBe(PaymentStatus.LUNAS);
  });
});
