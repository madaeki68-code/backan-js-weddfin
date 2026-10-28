import { describe, it, expect } from 'vitest';
import {
  filterItemsByDate,
  filterProjectsByDate,
  calculateTypeReportStats,
  calculateCityStats,
  calculatePackageStats,
  calculateTeamStats,
  calculateLeadConversionStats,
  calculateSatisfactionStats,
  calculateClientTransactionTotals,
} from '../utils/reportCalculations';
import {
  Client,
  Lead,
  Project,
  ClientType,
  ClientStatus,
  LeadStatus,
  SatisfactionLevel,
  ClientFeedback,
  TeamMember,
  Package,
  PaymentStatus,
  TransactionType,
  ContactChannel,
} from '../../../types';

describe('Business Reports Calculation Logic', () => {
  const mockClients: Client[] = [
    {
      id: 'c-1',
      name: 'Romeo & Juliet',
      email: 'romeo@example.com',
      phone: '08123456789',
      status: ClientStatus.ACTIVE,
      since: '2026-02-01',
      lastContact: '2026-02-01',
      portalAccessId: 'portal-1',
      clientType: ClientType.DIRECT,
      address: 'Bandung, Jawa Barat',
    },
    {
      id: 'c-2',
      name: 'Adam & Hawa',
      email: 'adam@example.com',
      phone: '08987654321',
      status: ClientStatus.ACTIVE,
      since: '2026-02-10',
      lastContact: '2026-02-10',
      portalAccessId: 'portal-2',
      clientType: ClientType.VENDOR,
      address: 'Jakarta Selatan',
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'p-1',
      clientId: 'c-1',
      projectName: 'Pernikahan Romeo',
      clientName: 'Romeo & Juliet',
      projectType: 'Wedding',
      packageId: 'pkg-1',
      date: '2026-05-15',
      packageName: 'Premium Story',
      totalCost: 15000000,
      amountPaid: 15000000,
      paymentStatus: PaymentStatus.LUNAS,
      status: 'Terjadwal',
      progress: 100,
      location: 'Bandung',
      addOns: [],
      team: [
        { memberId: 'tm-1', name: 'Andi', role: 'Lead Photographer', fee: 2000000 },
      ],
    },
    {
      id: 'p-2',
      clientId: 'c-2',
      projectName: 'Pernikahan Adam',
      clientName: 'Adam & Hawa',
      projectType: 'Wedding',
      packageId: 'pkg-2',
      date: '2026-06-20',
      packageName: 'Standard Story',
      totalCost: 10000000,
      amountPaid: 5000000,
      paymentStatus: PaymentStatus.DP_TERBAYAR,
      status: 'Terjadwal',
      progress: 50,
      location: 'Jakarta',
      addOns: [],
      team: [
        { memberId: 'tm-1', name: 'Andi', role: 'Lead Photographer', fee: 2000000 },
        { memberId: 'tm-2', name: 'Budi', role: 'Videographer', fee: 1500000 },
      ],
    },
  ];

  const mockLeads: Lead[] = [
    {
      id: 'l-1',
      name: 'Calon A',
      status: LeadStatus.CONVERTED,
      contactChannel: ContactChannel.INSTAGRAM,
      location: 'Bandung',
      date: '2026-02-01',
    },
    {
      id: 'l-2',
      name: 'Calon B',
      status: LeadStatus.FOLLOW_UP,
      contactChannel: ContactChannel.WHATSAPP,
      location: 'Jakarta',
      date: '2026-02-05',
    },
  ];

  const mockPackages: Package[] = [
    {
      id: 'pkg-1',
      name: 'Premium Story',
      category: 'Pernikahan',
      price: 15000000,
      physicalItems: [],
      digitalItems: [],
      processingTime: '14 Hari',
      features: ['2 Photographer', '1 Videographer'],
    },
    {
      id: 'pkg-2',
      name: 'Standard Story',
      category: 'Pernikahan',
      price: 10000000,
      physicalItems: [],
      digitalItems: [],
      processingTime: '14 Hari',
      features: ['1 Photographer'],
    },
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: 'tm-1',
      name: 'Andi',
      email: 'andi@example.com',
      phone: '0812345',
      role: 'Photographer',
      category: 'Tim',
      standardFee: 2000000,
      rating: 5,
      performanceNotes: [],
      portalAccessId: 'pa-tm1',
    },
    {
      id: 'tm-2',
      name: 'Budi',
      email: 'budi@example.com',
      phone: '0856789',
      role: 'Videographer',
      category: 'Tim',
      standardFee: 1500000,
      rating: 5,
      performanceNotes: [],
      portalAccessId: 'pa-tm2',
    },
  ];

  const mockFeedback: ClientFeedback[] = [
    {
      id: 'fb-1',
      clientName: 'Romeo & Juliet',
      rating: 5,
      feedback: 'Hasil foto luar biasa!',
      satisfaction: SatisfactionLevel.VERY_SATISFIED,
      date: '2026-05-20',
    },
  ];

  it('filters items correctly by date range', () => {
    const filtered = filterItemsByDate(mockClients, '2026-02-01', '2026-02-05', 'since');
    expect(filtered.length).toBe(1);
    expect(filtered[0].id).toBe('c-1');
  });

  it('calculates Direct vs Vendor stats accurately', () => {
    const stats = calculateTypeReportStats(mockClients, mockClients, mockProjects, '', '');
    expect(stats.typeReportDirectClients.length).toBe(1);
    expect(stats.typeReportVendorClients.length).toBe(1);
    expect(stats.typeReportDirectRevenue).toBe(15000000);
    expect(stats.typeReportVendorRevenue).toBe(10000000);
    expect(stats.typeReportRevenue).toBe(25000000);
    expect(stats.typeReportDirectShare).toBe('50');
    expect(stats.typeReportVendorShare).toBe('50');
  });

  it('calculates city distribution ranking correctly', () => {
    const cityStats = calculateCityStats(mockClients, mockLeads, mockProjects);
    expect(cityStats.length).toBeGreaterThan(0);
    const bandung = cityStats.find(c => c.name.includes('Bandung'));
    expect(bandung?.clientCount).toBe(1);
    expect(bandung?.totalRevenue).toBe(15000000);
  });

  it('calculates package statistics and revenue contribution', () => {
    const pkgStats = calculatePackageStats(mockPackages, mockProjects, 25000000, false);
    expect(pkgStats.length).toBe(2);
    const premium = pkgStats.find(p => p.name === 'Premium Story');
    expect(premium?.orderCount).toBe(1);
    expect(premium?.totalOmzet).toBe(15000000);
    expect(premium?.revenueContribution).toBe(60);
  });

  it('calculates team utilization and honorarium totals', () => {
    const teamStats = calculateTeamStats(mockTeamMembers, mockProjects);
    expect(teamStats.length).toBe(2);
    const andi = teamStats.find(t => t.name === 'Andi');
    expect(andi?.jobCount).toBe(2);
    expect(andi?.totalFee).toBe(4000000);
  });

  it('calculates lead conversion rates and channel breakdown', () => {
    const conv = calculateLeadConversionStats(mockLeads);
    expect(conv.total).toBe(2);
    expect(conv.converted).toBe(1);
    expect(conv.rate).toBe('50.0');
    expect(conv.channels.length).toBe(2);
  });

  it('calculates satisfaction ratings correctly', () => {
    const satisfaction = calculateSatisfactionStats(mockFeedback);
    expect(satisfaction.avgRating).toBe('5.0');
    expect(satisfaction.counts[SatisfactionLevel.VERY_SATISFIED]).toBe(1);
  });

  describe('Empty Dataset Regression Tests', () => {
    it('handles empty clients and projects in type stats without division by zero', () => {
      const emptyStats = calculateTypeReportStats([], [], [], '', '');
      expect(emptyStats.typeReportClients).toEqual([]);
      expect(emptyStats.typeReportDirectClients).toEqual([]);
      expect(emptyStats.typeReportVendorClients).toEqual([]);
      expect(emptyStats.typeReportDirectRevenue).toBe(0);
      expect(emptyStats.typeReportVendorRevenue).toBe(0);
      expect(emptyStats.typeReportRevenue).toBe(0);
      expect(emptyStats.typeReportAvgDirectRevenue).toBe(0);
      expect(emptyStats.typeReportAvgVendorRevenue).toBe(0);
      expect(emptyStats.typeReportAvgRevenuePerClient).toBe(0);
      expect(emptyStats.typeReportDirectShare).toBe('0');
      expect(emptyStats.typeReportVendorShare).toBe('0');
      expect(emptyStats.typeReportDirectRevenueShare).toBe('0');
      expect(emptyStats.typeReportVendorRevenueShare).toBe('0');
    });

    it('handles empty datasets in city stats', () => {
      const emptyCities = calculateCityStats([], [], []);
      expect(emptyCities).toEqual([]);
    });

    it('handles empty packages and projects in package stats', () => {
      const emptyPackages = calculatePackageStats([], [], 0, false);
      expect(emptyPackages).toEqual([]);
    });

    it('handles empty team members in team stats', () => {
      const emptyTeam = calculateTeamStats([], []);
      expect(emptyTeam).toEqual([]);
    });

    it('handles empty leads in conversion stats', () => {
      const emptyConversion = calculateLeadConversionStats([]);
      expect(emptyConversion.total).toBe(0);
      expect(emptyConversion.converted).toBe(0);
      expect(emptyConversion.rate).toBe('0');
      expect(emptyConversion.channels).toEqual([]);
    });

    it('handles empty feedback in satisfaction stats', () => {
      const emptySatisfaction = calculateSatisfactionStats([]);
      expect(emptySatisfaction.avgRating).toBe('0.0');
      expect(emptySatisfaction.counts[SatisfactionLevel.VERY_SATISFIED]).toBe(0);
      expect(emptySatisfaction.counts[SatisfactionLevel.SATISFIED]).toBe(0);
      expect(emptySatisfaction.counts[SatisfactionLevel.NEUTRAL]).toBe(0);
      expect(emptySatisfaction.counts[SatisfactionLevel.UNSATISFIED]).toBe(0);
    });

    it('handles empty transactions in transaction totals', () => {
      const projectClientIds = new Map<string, string>();
      const emptyTotals = calculateClientTransactionTotals([], projectClientIds);
      expect(emptyTotals.size).toBe(0);
    });
  });

  describe('Extended Aggregation & Edge Cases', () => {
    it('calculates client transaction totals correctly for income and expenses', () => {
      const projectClientIds = new Map<string, string>([
        ['p-1', 'c-1'],
        ['p-2', 'c-2'],
      ]);
      const mockTransactions: any[] = [
        {
          id: 'tx-1',
          projectId: 'p-1',
          type: TransactionType.INCOME,
          amount: 5000000,
          date: '2026-02-01',
        },
        {
          id: 'tx-2',
          projectId: 'p-1',
          type: TransactionType.EXPENSE,
          amount: 1500000,
          description: 'Cetak Album',
          date: '2026-02-05',
        },
        {
          id: 'tx-3',
          projectId: 'p-2',
          type: TransactionType.INCOME,
          amount: 3000000,
          date: '2026-02-10',
        },
      ];

      const totals = calculateClientTransactionTotals(mockTransactions, projectClientIds);
      expect(totals.get('c-1')?.income).toBe(5000000);
      expect(totals.get('c-1')?.expense).toBe(1500000);
      expect(totals.get('c-1')?.expenses.length).toBe(1);
      expect(totals.get('c-1')?.expenses[0].label).toBe('Cetak Album');
      expect(totals.get('c-2')?.income).toBe(3000000);
      expect(totals.get('c-2')?.expense).toBe(0);
    });

    it('filters projects by date boundaries cleanly', () => {
      const filtered = filterProjectsByDate(mockProjects, '2026-05-01', '2026-05-31');
      expect(filtered.length).toBe(1);
      expect(filtered[0].id).toBe('p-1');
    });

    it('handles package stats with date filter active', () => {
      // When hasDateFilter is true, packages with 0 orders are excluded
      const unbookedPackages: Package[] = [
        ...mockPackages,
        {
          id: 'pkg-unbooked',
          name: 'Paket Belum Dipesan',
          category: 'Prewedding',
          price: 5000000,
          physicalItems: [],
          digitalItems: [],
          processingTime: '14 Hari',
          features: [],
        },
      ];
      const filteredStats = calculatePackageStats(unbookedPackages, [mockProjects[0]], 15000000, true);
      expect(filteredStats.some(p => p.name === 'Paket Belum Dipesan')).toBe(false);
      expect(filteredStats.length).toBe(1);
      expect(filteredStats[0].name).toBe('Premium Story');
    });

    it('differentiates paid vs unpaid team fees based on project paymentStatus', () => {
      const stats = calculateTeamStats(mockTeamMembers, mockProjects);
      const andi = stats.find(t => t.name === 'Andi');
      // Andi worked on p-1 (LUNAS, 2jt) and p-2 (DP_TERBAYAR, 2jt)
      expect(andi?.paidFee).toBe(2000000);
      expect(andi?.unpaidFee).toBe(2000000);
      expect(andi?.totalFee).toBe(4000000);
    });

    it('aggregates all lead statuses and calculates conversion funnel cleanly', () => {
      const fullLeads: Lead[] = [
        { id: 'l-1', name: 'Lead 1', status: LeadStatus.CONVERTED, contactChannel: ContactChannel.INSTAGRAM, location: 'Jakarta', date: '2026-01-01' },
        { id: 'l-2', name: 'Lead 2', status: LeadStatus.DISCUSSION, contactChannel: ContactChannel.INSTAGRAM, location: 'Jakarta', date: '2026-01-02' },
        { id: 'l-3', name: 'Lead 3', status: LeadStatus.FOLLOW_UP, contactChannel: ContactChannel.WHATSAPP, location: 'Jakarta', date: '2026-01-03' },
        { id: 'l-4', name: 'Lead 4', status: LeadStatus.REJECTED, contactChannel: ContactChannel.OTHER, location: 'Jakarta', date: '2026-01-04' },
      ];
      const stats = calculateLeadConversionStats(fullLeads);
      expect(stats.total).toBe(4);
      expect(stats.converted).toBe(1);
      expect(stats.discussion).toBe(1);
      expect(stats.followUp).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.rate).toBe('25.0');
      expect(stats.channels.length).toBe(3);
    });

    it('accurately distributes multiple satisfaction levels', () => {
      const fullFeedback: ClientFeedback[] = [
        { id: '1', clientName: 'A', rating: 5, satisfaction: SatisfactionLevel.VERY_SATISFIED, feedback: 'Great', date: '2026-01-01' },
        { id: '2', clientName: 'B', rating: 4, satisfaction: SatisfactionLevel.SATISFIED, feedback: 'Good', date: '2026-01-02' },
        { id: '3', clientName: 'C', rating: 3, satisfaction: SatisfactionLevel.NEUTRAL, feedback: 'Okay', date: '2026-01-03' },
        { id: '4', clientName: 'D', rating: 2, satisfaction: SatisfactionLevel.UNSATISFIED, feedback: 'Needs work', date: '2026-01-04' },
      ];
      const stats = calculateSatisfactionStats(fullFeedback);
      expect(stats.avgRating).toBe('3.5');
      expect(stats.counts[SatisfactionLevel.VERY_SATISFIED]).toBe(1);
      expect(stats.counts[SatisfactionLevel.SATISFIED]).toBe(1);
      expect(stats.counts[SatisfactionLevel.NEUTRAL]).toBe(1);
      expect(stats.counts[SatisfactionLevel.UNSATISFIED]).toBe(1);
    });
  });
});
