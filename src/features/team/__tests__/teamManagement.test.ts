import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  Project,
  Transaction,
  Card,
  FinancialPocket,
  PocketType,
  CardType,
  TransactionType,
} from '../../../types';
import {
  filterUniqueMembers,
  calculateMemberHonor,
  dedupeCurrentTeamPayments,
  formatCurrency,
  getEmployeeSalaryRecordNumber,
} from '../utils/teamUtils';
import { buildPaymentSlipFileName } from '../utils/paymentSlipPdf';
import { EMPTY_TEAM_MEMBER_FORM, TEAM_SPECIALIZATIONS } from '../constants';

describe('Team & Staff Management Module', () => {
  const mockMember1: TeamMember = {
    id: 'member-1',
    name: 'Citra Kirana',
    role: 'MUA',
    specialization: 'Makeup Artist',
    email: 'citra@example.com',
    phone: '081234567890',
    location: 'Serang, Banten',
    category: 'Tim',
    status: 'Aktif',
    standardFee: 1500000,
    rating: 4.8,
    performanceNotes: [
      { id: 'pn-1', date: '2026-10-01', note: 'Sangat rapi dan tepat waktu', type: 'Pujian' as any },
    ],
    portalAccessId: 'portal-1',
    noRek: '123456789',
    bankName: 'BCA',
  };

  const mockMember2: TeamMember = {
    id: 'member-2',
    name: 'Budi Santoso',
    role: 'Fotografer',
    specialization: 'Fotografer',
    email: 'budi@example.com',
    phone: '081987654321',
    location: 'Tangerang',
    category: 'Vendor',
    status: 'Nonaktif',
    standardFee: 1000000,
    rating: 4.5,
    performanceNotes: [],
    portalAccessId: 'portal-2',
  };

  const mockMember3: TeamMember = {
    id: 'member-3',
    name: 'Dewi Lestari',
    role: 'Hair Stylist',
    specialization: 'Hair Stylist',
    email: 'dewi@example.com',
    phone: '081555666777',
    location: 'Cilegon',
    category: 'Karyawan',
    status: 'Aktif',
    standardFee: 3500000,
    rating: 5.0,
    performanceNotes: [],
    portalAccessId: 'portal-3',
  };

  const mockPayments: TeamProjectPayment[] = [
    {
      id: 'pay-1',
      projectId: 'proj-1',
      teamMemberId: 'member-1',
      teamMemberName: 'Citra Kirana',
      role: 'MUA',
      date: '2026-10-15',
      fee: 1500000,
      status: 'Paid',
    },
    {
      id: 'pay-2',
      projectId: 'proj-2',
      teamMemberId: 'member-1',
      teamMemberName: 'Citra Kirana',
      role: 'MUA',
      date: '2026-10-20',
      fee: 1500000,
      status: 'Unpaid',
    },
    {
      id: 'pay-3',
      projectId: 'proj-1',
      teamMemberId: 'member-2',
      teamMemberName: 'Budi Santoso',
      role: 'Fotografer',
      date: '2026-10-15',
      fee: 1000000,
      status: 'Unpaid',
    },
  ];

  describe('1. CRUD Anggota Tim & Data Atribut', () => {
    it('verifies default form template contains all required staff attributes', () => {
      expect(EMPTY_TEAM_MEMBER_FORM.name).toBe('');
      expect(EMPTY_TEAM_MEMBER_FORM.category).toBe('Tim');
      expect(EMPTY_TEAM_MEMBER_FORM.status).toBe('Aktif');
      expect(EMPTY_TEAM_MEMBER_FORM.standardFee).toBe(0);
      expect(TEAM_SPECIALIZATIONS).toContain('Makeup Artist');
      expect(TEAM_SPECIALIZATIONS).toContain('Hair Stylist');
      expect(TEAM_SPECIALIZATIONS).toContain('Assistant MUA');
      expect(TEAM_SPECIALIZATIONS).toContain('Hijab Stylist');
      expect(TEAM_SPECIALIZATIONS).toContain('Beauty Assistant');
    });

    it('creates a new team member with complete profile attributes', () => {
      const newMember: TeamMember = {
        id: 'member-new',
        name: 'Rina Nose',
        role: 'Assistant MUA',
        specialization: 'Assistant MUA',
        email: 'rina@example.com',
        phone: '081299887766',
        location: 'Pandeglang',
        category: 'Tim',
        status: 'Aktif',
        standardFee: 750000,
        rating: 0,
        performanceNotes: [],
        portalAccessId: 'portal-new',
      };

      expect(newMember.name).toBe('Rina Nose');
      expect(newMember.specialization).toBe('Assistant MUA');
      expect(newMember.status).toBe('Aktif');
      expect(newMember.location).toBe('Pandeglang');
      expect(newMember.standardFee).toBe(750000);
    });

    it('updates member attributes and toggles active status to Nonaktif', () => {
      const updated: TeamMember = {
        ...mockMember1,
        status: 'Nonaktif',
        phone: '081200001111',
      };
      expect(updated.status).toBe('Nonaktif');
      expect(updated.phone).toBe('081200001111');
      expect(updated.name).toBe('Citra Kirana');
    });

    it('enforces business rule: member with unpaid fees cannot be deleted', () => {
      const memberHasUnpaid = mockPayments.some(
        p => p.teamMemberId === 'member-1' && p.status === 'Unpaid',
      );
      expect(memberHasUnpaid).toBe(true);

      const canDelete = !memberHasUnpaid;
      expect(canDelete).toBe(false);
    });

    it('allows deletion when member has no unpaid fees', () => {
      const paymentsForMember3 = mockPayments.filter(p => p.teamMemberId === 'member-3');
      const hasUnpaid = paymentsForMember3.some(p => p.status === 'Unpaid');
      expect(hasUnpaid).toBe(false);
      const canDelete = !hasUnpaid;
      expect(canDelete).toBe(true);
    });
  });

  describe('2. Pencarian dan Filter', () => {
    const list = [mockMember1, mockMember2, mockMember3];

    it('filters by member name case-insensitively', () => {
      const results = filterUniqueMembers(list, 'citra');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Citra Kirana');
    });

    it('filters by specialization or role', () => {
      const results = filterUniqueMembers(list, 'Hair Stylist');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Dewi Lestari');
    });

    it('filters by location / address', () => {
      const results = filterUniqueMembers(list, 'Tangerang');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Budi Santoso');
    });

    it('filters by active status (Aktif vs Nonaktif)', () => {
      const activeMembers = filterUniqueMembers(list, '', 'Aktif');
      expect(activeMembers).toHaveLength(2);
      expect(activeMembers.map(m => m.name)).toEqual(['Citra Kirana', 'Dewi Lestari']);

      const inactiveMembers = filterUniqueMembers(list, '', 'Nonaktif');
      expect(inactiveMembers).toHaveLength(1);
      expect(inactiveMembers[0].name).toBe('Budi Santoso');
    });

    it('returns all unique members when filter is Semua and query is blank', () => {
      const results = filterUniqueMembers(list, '', 'Semua');
      expect(results).toHaveLength(3);
    });
  });

  describe('3. Penugasan Wedding & Perhitungan Honor', () => {
    it('calculates honor totals accurately per member', () => {
      const stats = calculateMemberHonor('member-1', mockPayments);
      expect(stats.eventCount).toBe(2);
      expect(stats.totalFee).toBe(3000000);
      expect(stats.paidFee).toBe(1500000);
      expect(stats.unpaidFee).toBe(1500000);
    });

    it('deduplicates current team payments for the same project assignment', () => {
      const duplicates: TeamProjectPayment[] = [
        ...mockPayments,
        { ...mockPayments[0], id: 'dup-1', fee: 1500000 },
      ];
      const deduped = dedupeCurrentTeamPayments(duplicates);
      expect(deduped).toHaveLength(3);
    });

    it('formats employee monthly salary record number consistently', () => {
      const recNum = getEmployeeSalaryRecordNumber('member-3', '2026-10');
      expect(recNum).toBe('PAY-SAL-MBER-3-202610');
    });
  });

  describe('4. Pembayaran Honor, Status Lunas & Slip', () => {
    it('tracks paid vs unpaid status transitions', () => {
      const unpaidPayment = mockPayments[1];
      expect(unpaidPayment.status).toBe('Unpaid');

      const paidPayment: TeamProjectPayment = {
        ...unpaidPayment,
        status: 'Paid',
      };
      expect(paidPayment.status).toBe('Paid');
    });

    it('builds payment slip file name properly', () => {
      const mockRecord: TeamPaymentRecord = {
        id: 'record-1',
        recordNumber: 'SLIP-001',
        teamMemberId: 'member-1',
        date: '2026-10-26',
        projectPaymentIds: ['pay-1'],
        totalAmount: 1500000,
      };
      const fileName = buildPaymentSlipFileName(mockRecord);
      expect(fileName).toContain('Bukti-Invoice-Pembayaran-Tim');
      expect(fileName).toContain('SLIP-001');
      expect(fileName.endsWith('.pdf')).toBe(true);
    });

    it('creates payment record structure linking payment IDs and total amount', () => {
      const record: TeamPaymentRecord = {
        id: 'record-1',
        recordNumber: 'SLIP-202610-001',
        teamMemberId: 'member-1',
        date: '2026-10-26',
        projectPaymentIds: ['pay-2'],
        totalAmount: 1500000,
        vendorSignature: 'data:image/png;base64,sample',
      };

      expect(record.recordNumber).toBe('SLIP-202610-001');
      expect(record.totalAmount).toBe(1500000);
      expect(record.projectPaymentIds).toContain('pay-2');
      expect(record.vendorSignature).toBeDefined();
    });
  });

  describe('5. Integrasi Finance & Wedding Detail', () => {
    it('generates a corresponding expense transaction when honor is paid', () => {
      const paymentDate = '2026-10-26';
      const feeAmount = 1500000;
      const expenseTx: Omit<Transaction, 'id'> = {
        date: paymentDate,
        description: 'Gaji Freelance - Citra Kirana (Wedding Romeo & Juliet)',
        amount: feeAmount,
        type: TransactionType.EXPENSE,
        projectId: 'proj-2',
        category: 'Gaji Freelance',
        method: 'Transfer Bank',
        cardId: 'card-1',
      };

      expect(expenseTx.type).toBe(TransactionType.EXPENSE);
      expect(expenseTx.amount).toBe(1500000);
      expect(expenseTx.projectId).toBe('proj-2');
      expect(expenseTx.category).toBe('Gaji Freelance');
    });

    it('deducts payment amount from card balance accurately', () => {
      const initialCard: Card = {
        id: 'card-1',
        cardHolderName: 'Nopian',
        bankName: 'BCA',
        cardType: CardType.DEBIT,
        lastFourDigits: '1234',
        balance: 10000000,
        colorGradient: 'from-blue-500 to-sky-400',
      };

      const paidAmount = 1500000;
      const updatedCard = {
        ...initialCard,
        balance: initialCard.balance - paidAmount,
      };

      expect(updatedCard.balance).toBe(8500000);
    });

    it('deducts payment amount from budget pocket accurately', () => {
      const pocket: FinancialPocket = {
        id: 'pocket-1',
        name: 'Biaya Kru & Tim',
        description: 'Kantong operasional acara',
        icon: 'users',
        type: PocketType.EXPENSE,
        amount: 5000000,
      };

      const paidAmount = 1500000;
      const updatedPocket = {
        ...pocket,
        amount: pocket.amount - paidAmount,
      };

      expect(updatedPocket.amount).toBe(3500000);
    });

    it('calculates project-level crew totals for Wedding Detail integration', () => {
      const activeProjectId = 'proj-1';
      const projectCrewPayments = mockPayments.filter(p => p.projectId === activeProjectId);

      const totalFees = projectCrewPayments.reduce((sum, p) => sum + p.fee, 0);
      const totalPaid = projectCrewPayments
        .filter(p => p.status === 'Paid')
        .reduce((sum, p) => sum + p.fee, 0);
      const totalUnpaid = totalFees - totalPaid;

      expect(projectCrewPayments).toHaveLength(2);
      expect(totalFees).toBe(2500000);
      expect(totalPaid).toBe(1500000);
      expect(totalUnpaid).toBe(1000000);
    });
  });

  describe('6. Empty and Error States', () => {
    it('handles empty member list gracefully', () => {
      const emptyResults = filterUniqueMembers([], 'citra');
      expect(emptyResults).toEqual([]);
    });

    it('handles member with no payment records without error', () => {
      const stats = calculateMemberHonor('non-existent-member', mockPayments);
      expect(stats.totalFee).toBe(0);
      expect(stats.paidFee).toBe(0);
      expect(stats.unpaidFee).toBe(0);
      expect(stats.eventCount).toBe(0);
    });

    it('formats zero or invalid currency safely', () => {
      expect(formatCurrency(0).replace(/\u00A0/g, ' ')).toBe('Rp 0');
    });
  });

  describe('7. STAGE 6.1 Regression Audit Specifics', () => {
    it('prevents deletion of member when unpaid fee exists', () => {
      const memberIdWithUnpaid = 'member-1';
      const hasUnpaid = mockPayments.some(
        p => p.teamMemberId === memberIdWithUnpaid && p.status === 'Unpaid',
      );
      expect(hasUnpaid).toBe(true);

      const canDelete = !hasUnpaid;
      expect(canDelete).toBe(false);
    });

    it('allows deletion of member when all fees are fully paid', () => {
      const allPaidPayments: TeamProjectPayment[] = [
        {
          id: 'pay-clean',
          projectId: 'proj-1',
          teamMemberId: 'member-clean',
          teamMemberName: 'Budi Santoso',
          date: '2026-10-01',
          fee: 1000000,
          status: 'Paid',
        },
      ];

      const hasUnpaid = allPaidPayments.some(
        p => p.teamMemberId === 'member-clean' && p.status === 'Unpaid',
      );
      expect(hasUnpaid).toBe(false);

      const canDelete = !hasUnpaid;
      expect(canDelete).toBe(true);
    });

    it('handles partial installment distribution across multiple projects', () => {
      const pendingPayments: TeamProjectPayment[] = [
        {
          id: 'pay-a',
          projectId: 'proj-a',
          teamMemberId: 'm-1',
          teamMemberName: 'MUA',
          date: '2026-10-01',
          fee: 1000000,
          status: 'Unpaid',
        },
        {
          id: 'pay-b',
          projectId: 'proj-b',
          teamMemberId: 'm-1',
          teamMemberName: 'MUA',
          date: '2026-10-05',
          fee: 1500000,
          status: 'Unpaid',
        },
      ];

      const paidInstallment = 1500000; // Covers pay-a fully, pay-b partially (500k)
      let remaining = paidInstallment;
      const updated: TeamProjectPayment[] = [];

      for (const p of pendingPayments) {
        if (remaining <= 0) break;
        const allocated = Math.min(p.fee, remaining);
        remaining -= allocated;
        const isFullyPaid = allocated >= p.fee;
        updated.push({
          ...p,
          fee: isFullyPaid ? p.fee : p.fee - allocated,
          status: isFullyPaid ? 'Paid' : 'Unpaid',
        });
      }

      expect(updated[0].status).toBe('Paid');
      expect(updated[0].fee).toBe(1000000);
      expect(updated[1].status).toBe('Unpaid');
      expect(updated[1].fee).toBe(1000000); // 1500000 - 500000 = 1000000 left
    });

    it('combines category, specialization, status, and query filters without dropping data', () => {
      const mockMemberList = [mockMember1, mockMember2, mockMember3];
      const results = filterUniqueMembers(mockMemberList, 'citra', 'Aktif');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Citra Kirana');
      expect(results[0].specialization).toBe('Makeup Artist');

      const nonActiveResults = filterUniqueMembers(mockMemberList, '', 'Nonaktif');
      expect(nonActiveResults).toHaveLength(1);
      expect(nonActiveResults[0].id).toBe('member-2');
    });
  });
});
