import { describe, it, expect } from 'vitest';
import {
  calculateDashboardSummary,
  getUpcomingEvents,
  getPendingAndOverdueTasks,
  getUpcomingTeamAssignments,
  getFinancialChartData,
  getFinancialHealth,
  getLeadMetrics,
  getPackageDistribution,
  getClientSatisfaction,
  formatCurrency,
  getStatusClass,
  getSubStatusDisplay,
} from '../utils/dashboardCalculations';
import {
  Project,
  Client,
  Transaction,
  TransactionType,
  TeamMember,
  Card,
  Lead,
  LeadStatus,
  ContactChannel,
  TeamProjectPayment,
  ClientFeedback,
  ClientStatus,
  ClientType,
  PaymentStatus,
  CardType,
  ProjectStatusConfig,
  SatisfactionLevel,
} from '../../../types';
import { EMPTY_DASHBOARD_TOTALS } from '../constants';

describe('Dashboard Modular Feature — Logic & Calculations', () => {
  const mockNow = new Date('2026-10-25T10:00:00Z');

  const mockClients: Client[] = [
    {
      id: 'client-1',
      name: 'Rian & Maya',
      email: 'rian@example.com',
      phone: '08123456789',
      status: ClientStatus.ACTIVE,
      clientType: ClientType.DIRECT,
      since: '2026-01-01',
      lastContact: '2026-10-20',
      portalAccessId: 'portal-1',
    },
    {
      id: 'client-2',
      name: 'Budi & Dewi',
      email: 'budi@example.com',
      phone: '08987654321',
      status: ClientStatus.INACTIVE,
      clientType: ClientType.DIRECT,
      since: '2025-05-01',
      lastContact: '2025-06-01',
      portalAccessId: 'portal-2',
    },
  ];

  const mockProjects: Project[] = [
    {
      id: 'proj-1',
      projectName: 'Pernikahan Rian & Maya',
      clientName: 'Rian & Maya',
      clientId: 'client-1',
      projectType: 'Wedding Reception',
      packageName: 'Exclusive Wedding',
      packageId: 'pkg-1',
      addOns: [],
      date: '2026-10-28T09:00:00Z', // 3 days after mockNow
      deadlineDate: '2026-10-27T00:00:00Z',
      location: 'Grand Ballroom Jakarta',
      progress: 60,
      status: 'Persiapan',
      totalCost: 15000000,
      amountPaid: 10000000,
      paymentStatus: PaymentStatus.DP_TERBAYAR,
      team: [
        { memberId: 'team-1', name: 'Nopian Hadi', role: 'Lead Photographer', fee: 2000000 },
        { memberId: 'team-2', name: 'Andi Saputra', role: 'Videographer', fee: 1500000 },
      ],
      tasks: [
        { id: 'task-1', name: 'Briefing Tim & Rundown', completed: false },
        { id: 'task-2', name: 'Cek Baterai & Lensa', completed: true },
      ],
    },
    {
      id: 'proj-2',
      projectName: 'Pernikahan Bayu & Citra',
      clientName: 'Bayu & Citra',
      clientId: 'client-3',
      projectType: 'Akad Nikah',
      packageName: 'Intimate Ceremony',
      packageId: 'pkg-2',
      addOns: [],
      date: '2026-10-25T07:00:00Z', // Today relative to mockNow
      deadlineDate: '2026-10-24T00:00:00Z', // Overdue relative to mockNow
      location: 'Masjid Raya Banten',
      progress: 40,
      status: 'Booking Terkonfirmasi',
      totalCost: 8000000,
      amountPaid: 8000000,
      paymentStatus: PaymentStatus.LUNAS,
      team: [
        { memberId: 'team-1', name: 'Nopian Hadi', role: 'Lead Photographer', fee: 1800000 },
      ],
      tasks: [
        { id: 'task-3', name: 'Kirim Invoice Pelunasan', completed: false },
      ],
    },
    {
      id: 'proj-past',
      projectName: 'Acara Masa Lalu',
      clientName: 'Doni & Eka',
      clientId: 'client-4',
      projectType: 'Prewedding',
      packageName: 'Outdoor Prewedding',
      packageId: 'pkg-3',
      addOns: [],
      date: '2026-09-10T00:00:00Z', // Past event
      location: 'Bandung',
      progress: 100,
      status: 'Selesai',
      totalCost: 5000000,
      amountPaid: 5000000,
      paymentStatus: PaymentStatus.LUNAS,
      team: [],
    },
    {
      id: 'proj-canceled',
      projectName: 'Acara Batal',
      clientName: 'Fajar & Gita',
      clientId: 'client-5',
      projectType: 'Engagement',
      packageName: 'Standard',
      packageId: 'pkg-4',
      addOns: [],
      date: '2026-11-15T00:00:00Z',
      location: 'Tangerang',
      progress: 0,
      status: 'Dibatalkan',
      totalCost: 4000000,
      amountPaid: 1000000,
      paymentStatus: PaymentStatus.DP_TERBAYAR,
      team: [],
    },
  ];

  const mockCards: Card[] = [
    {
      id: 'CARD_BCA',
      bankName: 'BCA Prioritas',
      cardType: CardType.DEBIT,
      balance: 45000000,
      cardHolderName: 'Attera Visual',
      lastFourDigits: '1234',
      colorGradient: 'from-blue-500 to-sky-400',
    },
    {
      id: 'CARD_CASH',
      bankName: 'Kas Tunai',
      cardType: CardType.TUNAI,
      balance: 5500000,
      cardHolderName: 'Kas Studio',
      lastFourDigits: '0000',
      colorGradient: 'from-emerald-500 to-teal-400',
    },
  ];

  const mockTransactions: Transaction[] = [
    {
      id: 't-1',
      date: '2026-10-10T10:00:00Z',
      amount: 10000000,
      type: TransactionType.INCOME,
      category: 'DP Paket',
      description: 'DP Pernikahan Rian & Maya',
      cardId: 'CARD_BCA',
      method: 'Transfer Bank',
    },
    {
      id: 't-2',
      date: '2026-10-15T12:00:00Z',
      amount: 8000000,
      type: TransactionType.INCOME,
      category: 'Pelunasan',
      description: 'Pelunasan Bayu & Citra',
      cardId: 'CARD_BCA',
      method: 'Transfer Bank',
    },
    {
      id: 't-3',
      date: '2026-10-16T14:00:00Z',
      amount: 3000000,
      type: TransactionType.EXPENSE,
      category: 'Operasional',
      description: 'Cetak Album & Cetak Foto',
      cardId: 'CARD_CASH',
      method: 'Tunai',
    },
    {
      id: 't-past',
      date: '2026-09-05T09:00:00Z',
      amount: 5000000,
      type: TransactionType.INCOME,
      category: 'Pelunasan',
      description: 'Transaksi Bulan Lalu',
      cardId: 'CARD_BCA',
      method: 'Transfer Bank',
    },
  ];

  const mockTeamMembers: TeamMember[] = [
    {
      id: 'team-1',
      name: 'Nopian Hadi',
      role: 'Lead Photographer',
      email: 'nopian@example.com',
      phone: '0811111111',
      standardFee: 2000000,
      rating: 5,
      performanceNotes: [],
      portalAccessId: 'portal-nopian',
      category: 'Tim',
    },
    {
      id: 'team-2',
      name: 'Andi Saputra',
      role: 'Videographer',
      email: 'andi@example.com',
      phone: '0822222222',
      standardFee: 1500000,
      rating: 4.8,
      performanceNotes: [],
      portalAccessId: 'portal-andi',
      category: 'Tim',
    },
  ];

  const mockTeamPayments: TeamProjectPayment[] = [
    {
      id: 'pay-1',
      teamMemberId: 'team-1',
      teamMemberName: 'Nopian Hadi',
      projectId: 'proj-1',
      fee: 2000000,
      status: 'Unpaid',
      date: '2026-10-20',
    },
    {
      id: 'pay-2',
      teamMemberId: 'team-2',
      teamMemberName: 'Andi Saputra',
      projectId: 'proj-1',
      fee: 1500000,
      status: 'Paid',
      date: '2026-10-20',
    },
  ];

  const mockLeads: Lead[] = [
    {
      id: 'lead-1',
      name: 'Dimas & Sinta',
      contactChannel: ContactChannel.WHATSAPP,
      location: 'Serang',
      status: LeadStatus.DISCUSSION,
      date: '2026-10-24T00:00:00Z',
    },
    {
      id: 'lead-2',
      name: 'Rudi & Putri',
      contactChannel: ContactChannel.INSTAGRAM,
      location: 'Cilegon',
      status: LeadStatus.CONVERTED,
      date: '2026-10-23T00:00:00Z',
    },
    {
      id: 'lead-3',
      name: 'Hendra & Lia',
      contactChannel: ContactChannel.WHATSAPP,
      location: 'Tangerang',
      status: LeadStatus.FOLLOW_UP,
      date: '2026-10-22T00:00:00Z',
    },
  ];

  const mockFeedback: ClientFeedback[] = [
    {
      id: 'fb-1',
      clientName: 'Rian & Maya',
      satisfaction: SatisfactionLevel.VERY_SATISFIED,
      rating: 5,
      feedback: 'Hasil foto dan pelayanan sangat memuaskan!',
      date: '2026-10-20T00:00:00Z',
    },
    {
      id: 'fb-2',
      clientName: 'Budi & Dewi',
      satisfaction: SatisfactionLevel.SATISFIED,
      rating: 4,
      feedback: 'Bagus dan tepat waktu',
      date: '2026-06-01T00:00:00Z',
    },
  ];

  // 1. KPI & Summary Calculation
  it('calculates dashboard summary and KPIs accurately', () => {
    const summary = calculateDashboardSummary(
      mockProjects,
      mockClients,
      mockTransactions,
      mockCards,
      {
        ...EMPTY_DASHBOARD_TOTALS,
        activeProjects: 2,
        activeClients: 1,
        teamMembers: 2,
      },
      mockTeamPayments,
      mockNow
    );

    // Total balance: 45,000,000 + 5,500,000 = 50,500,000
    expect(summary.totalBalance).toBe(50500000);
    expect(summary.activeProjects).toBe(2);
    expect(summary.activeClients).toBe(1);
    expect(summary.totalTeamMembers).toBe(2);

    // Income October 2026: t-1 (10,000,000) + t-2 (8,000,000) = 18,000,000
    expect(summary.incomeThisMonth).toBe(18000000);
    // Expense October 2026: t-3 (3,000,000)
    expect(summary.expenseThisMonth).toBe(3000000);

    // Events this month: proj-1 and proj-2 are in October 2026 (proj-past is Sept, proj-canceled is Nov)
    expect(summary.eventsThisMonth).toBe(2);

    // Unpaid invoices: proj-1 has unpaid balance (paymentStatus = DP_TERBAYAR, total 15m, paid 10m).
    // proj-2 is LUNAS. proj-canceled is ignored since status is Dibatalkan.
    expect(summary.unpaidInvoices).toBe(1);
    expect(summary.totalUnpaidReceivables).toBe(5000000);

    // Unpaid team honor: pay-1 is Unpaid with fee 2,000,000
    expect(summary.totalUnpaidTeamHonor).toBe(2000000);
  });

  // 2. Upcoming Weddings Calculation
  it('identifies and orders upcoming wedding events, excluding finished/canceled ones', () => {
    const events = getUpcomingEvents(mockProjects, mockNow);

    expect(events.length).toBe(2);
    // Earliest event should be today's event (proj-2: 2026-10-25)
    expect(events[0].id).toBe('proj-2');
    expect(events[0].isToday).toBe(true);
    expect(events[0].countdownText).toBe('Hari Ini');

    // Next event should be proj-1 (2026-10-28)
    expect(events[1].id).toBe('proj-1');
    expect(events[1].isToday).toBe(false);
    expect(events[1].countdownDays).toBe(3);
    expect(events[1].countdownText).toBe('3 Hari Lagi');
    expect(events[1].unpaidBalance).toBe(5000000);
  });

  // 3. Pending & Overdue Tasks
  it('detects pending tasks and calculates overdue days correctly', () => {
    const tasks = getPendingAndOverdueTasks(mockProjects, mockNow);

    // Expected 2 uncompleted tasks: task-3 in proj-2, task-1 in proj-1
    expect(tasks.length).toBe(2);

    // task-3 in proj-2 has deadlineDate 2026-10-24, which is in the past relative to 2026-10-25
    const overdueTask = tasks.find((t) => t.taskId === 'task-3');
    expect(overdueTask).toBeDefined();
    expect(overdueTask?.isOverdue).toBe(true);
    expect(overdueTask?.daysDiff).toBeLessThan(0);

    // task-1 in proj-1 has deadlineDate 2026-10-27, which is upcoming
    const upcomingTask = tasks.find((t) => t.taskId === 'task-1');
    expect(upcomingTask).toBeDefined();
    expect(upcomingTask?.isOverdue).toBe(false);
    expect(upcomingTask?.daysDiff).toBeGreaterThanOrEqual(0);
  });

  // 4. Financial Health and Chart Data
  it('computes financial health indicators and monthly/projection chart points', () => {
    const health = getFinancialHealth(mockTransactions, mockNow);
    expect(health.monthlyRevenue).toBe(18000000);
    expect(health.monthlyExpense).toBe(3000000);
    // Margin: (18m - 3m) / 18m * 100 = 83.333%
    expect(health.margin).toBeCloseTo(83.33, 1);

    const monthlyChart = getFinancialChartData(mockTransactions, mockProjects, 'monthly', mockNow);
    expect(monthlyChart.length).toBe(12);
    // Month index 9 is October (0-indexed: Jan=0, Oct=9)
    expect(monthlyChart[9].income).toBe(18000000);
    expect(monthlyChart[9].expense).toBe(3000000);

    const projChart = getFinancialChartData(mockTransactions, mockProjects, 'projection', mockNow);
    expect(projChart.length).toBe(6);
    expect(projChart[0].isProjected).toBe(true);
  });

  // 5. CRM & Lead Metrics
  it('computes lead metrics, conversion funnel, and channel distribution', () => {
    const metrics = getLeadMetrics(mockLeads);
    expect(metrics.totalLeads).toBe(3);
    expect(metrics.convertedCount).toBe(1);
    expect(metrics.discussionCount).toBe(2); // DISCUSSION + CONVERTED
    expect(metrics.conversionRate).toBeCloseTo(33.33, 1);

    expect(metrics.sourceData.length).toBe(2);
    expect(metrics.sourceData[0].name).toBe(ContactChannel.WHATSAPP);
    expect(metrics.sourceData[0].count).toBe(2);
  });

  // 6. Upcoming Team Assignments
  it('extracts team assignments for upcoming weddings', () => {
    const assignments = getUpcomingTeamAssignments(mockProjects, mockTeamMembers, mockNow);
    expect(assignments.length).toBeGreaterThan(0);
    // The first assignment should be for today's event (proj-2)
    expect(assignments[0].projectId).toBe('proj-2');
    expect(assignments[0].memberName).toBe('Nopian Hadi');
  });

  // 7. Client Satisfaction & Package Distribution
  it('calculates average satisfaction rating and package popularity', () => {
    const satisfaction = getClientSatisfaction(mockFeedback);
    expect(satisfaction.totalFeedback).toBe(2);
    expect(satisfaction.avgRating).toBe(4.5);

    const packages = getPackageDistribution(mockProjects);
    expect(packages.length).toBeGreaterThan(0);
    const exclusivePkg = packages.find((p) => p.name === 'Exclusive Wedding');
    expect(exclusivePkg?.count).toBe(1);
  });

  // 8. Empty States & Robust Fallbacks
  it('handles empty data, null values, and edge cases gracefully without crashing', () => {
    const emptySummary = calculateDashboardSummary([], [], [], [], undefined, [], mockNow);
    expect(emptySummary.totalBalance).toBe(0);
    expect(emptySummary.activeProjects).toBe(0);
    expect(emptySummary.activeClients).toBe(0);
    expect(emptySummary.incomeThisMonth).toBe(0);
    expect(emptySummary.unpaidInvoices).toBe(0);

    const emptyEvents = getUpcomingEvents([]);
    expect(emptyEvents).toEqual([]);

    const emptyTasks = getPendingAndOverdueTasks([]);
    expect(emptyTasks).toEqual([]);

    const emptyHealth = getFinancialHealth([]);
    expect(emptyHealth.monthlyRevenue).toBe(0);
    expect(emptyHealth.monthlyExpense).toBe(0);
    expect(emptyHealth.margin).toBe(0);

    const emptyLeads = getLeadMetrics([]);
    expect(emptyLeads.totalLeads).toBe(0);
    expect(emptyLeads.conversionRate).toBe(0);

    const formattedZero = formatCurrency(0);
    expect(formattedZero).toContain('0');

    const formattedNaN = formatCurrency(NaN);
    expect(formattedNaN).toContain('0');
  });

  // 9. Status and Sub-Status Formatters
  it('formats status class and sub-status strings properly', () => {
    const configs: ProjectStatusConfig[] = [
      { id: '1', name: 'Persiapan', color: '#3b82f6', subStatuses: [], note: '' },
    ];
    const statusClass = getStatusClass('Persiapan', configs);
    expect(statusClass).toBe('solid-blue text-white');

    const unknownClass = getStatusClass('NonExistent', configs);
    expect(unknownClass).toBe('bg-slate-500 text-white');

    const projWithSub: Project = {
      ...mockProjects[0],
      activeSubStatuses: ['Moodboard Disetujui', 'Fitting Selesai'],
    };
    expect(getSubStatusDisplay(projWithSub)).toBe(
      'Persiapan: Moodboard Disetujui, Fitting Selesai'
    );
  });
});
