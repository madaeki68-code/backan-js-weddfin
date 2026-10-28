import {
  Project,
  Client,
  Transaction,
  TransactionType,
  TeamMember,
  Card,
  Lead,
  LeadStatus,
  TeamProjectPayment,
  ClientFeedback,
  ClientStatus,
  PaymentStatus,
  ProjectStatusConfig,
} from '../../../types';
import {
  DashboardSummary,
  DashboardTotals,
  UpcomingEventItem,
  PendingTaskItem,
  UpcomingTeamAssignment,
  ChartDataPoint,
} from '../types';
import { STATUS_COLOR_MAP, MONTH_NAMES_ID } from '../constants';

/**
 * Format numeric value to Indonesian Rupiah currency string
 */
export const formatCurrency = (amount: number, minimumFractionDigits = 0): string => {
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits,
  }).format(safeAmount);
};

/**
 * Resolve UI badge styling for project status
 */
export const getStatusClass = (status: string, config: ProjectStatusConfig[] = []): string => {
  const statusConfig = config.find((c) => c.name === status);
  const color = statusConfig ? statusConfig.color : '#64748b';
  return STATUS_COLOR_MAP[color] || 'bg-slate-500 text-white';
};

/**
 * Resolve project sub-status display text
 */
export const getSubStatusDisplay = (project: Project): string => {
  if (project.activeSubStatuses && project.activeSubStatuses.length > 0) {
    return `${project.status}: ${project.activeSubStatuses.join(', ')}`;
  }
  if (project.status === 'Dikirim' && project.shippingDetails) {
    return `Dikirim: ${project.shippingDetails}`;
  }
  return project.status;
};

/**
 * Extract pending and overdue tasks across all active projects
 */
export const getPendingAndOverdueTasks = (
  projects: Project[] = [],
  referenceDate: Date = new Date()
): PendingTaskItem[] => {
  const refTime = new Date(referenceDate);
  refTime.setHours(0, 0, 0, 0);

  const items: PendingTaskItem[] = [];

  projects.forEach((project) => {
    if (project.status === 'Selesai' || project.status === 'Dibatalkan') {
      return;
    }

    if (!Array.isArray(project.tasks) || project.tasks.length === 0) {
      return;
    }

    // Determine target dueDate: deadlineDate or project.date
    const targetDateStr = project.deadlineDate || project.date;
    const targetDate = targetDateStr ? new Date(targetDateStr) : null;
    let isOverdue = false;
    let daysDiff = 0;

    if (targetDate && !Number.isNaN(targetDate.getTime())) {
      const targetTime = new Date(targetDate);
      targetTime.setHours(0, 0, 0, 0);
      daysDiff = Math.ceil((targetTime.getTime() - refTime.getTime()) / (1000 * 60 * 60 * 24));
      isOverdue = daysDiff < 0;
    }

    project.tasks.forEach((task) => {
      if (!task.completed) {
        items.push({
          id: `${project.id}-${task.id}`,
          taskId: task.id,
          taskName: task.name,
          projectId: project.id,
          projectName: project.projectName || 'Acara Tanpa Nama',
          clientId: project.clientId,
          clientName: project.clientName || 'Klien',
          eventDate: project.date,
          deadlineDate: project.deadlineDate,
          isOverdue,
          daysDiff,
        });
      }
    });
  });

  // Sort: overdue first (most overdue first), then upcoming nearest due date
  return items.sort((a, b) => a.daysDiff - b.daysDiff);
};

/**
 * Filter and sort upcoming wedding events
 */
export const getUpcomingEvents = (
  projects: Project[] = [],
  referenceDate: Date = new Date(),
  limit = 5
): UpcomingEventItem[] => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const filtered = projects.filter((p) => {
    if (!p.date) return false;
    const eventDate = new Date(p.date);
    eventDate.setHours(0, 0, 0, 0);
    return (
      !Number.isNaN(eventDate.getTime()) &&
      eventDate.getTime() >= today.getTime() &&
      p.status !== 'Selesai' &&
      p.status !== 'Dibatalkan'
    );
  });

  filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return filtered.slice(0, limit).map((p) => {
    const eventDate = new Date(p.date);
    eventDate.setHours(0, 0, 0, 0);
    const daysAway = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const isToday = daysAway === 0;
    const countdownText = isToday ? 'Hari Ini' : daysAway > 0 ? `${daysAway} Hari Lagi` : 'Selesai';
    const totalCost = Number(p.totalCost) || 0;
    const amountPaid = Number(p.amountPaid) || 0;
    const unpaidBalance = Math.max(0, totalCost - amountPaid);

    return {
      id: p.id,
      projectName: p.projectName,
      clientName: p.clientName,
      clientId: p.clientId,
      projectType: p.projectType,
      packageName: p.packageName,
      date: p.date,
      location: p.location || '',
      status: p.status,
      countdownDays: daysAway,
      countdownText,
      isToday,
      totalCost,
      amountPaid,
      unpaidBalance,
    };
  });
};

/**
 * Extract upcoming team assignments from active upcoming projects
 */
export const getUpcomingTeamAssignments = (
  projects: Project[] = [],
  teamMembers: TeamMember[] = [],
  referenceDate: Date = new Date(),
  limit = 5
): UpcomingTeamAssignment[] => {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  const upcomingProjects = projects
    .filter((p) => {
      if (!p.date) return false;
      const d = new Date(p.date);
      d.setHours(0, 0, 0, 0);
      return (
        !Number.isNaN(d.getTime()) &&
        d.getTime() >= today.getTime() &&
        p.status !== 'Selesai' &&
        p.status !== 'Dibatalkan' &&
        Array.isArray(p.team) &&
        p.team.length > 0
      );
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const assignments: UpcomingTeamAssignment[] = [];

  for (const project of upcomingProjects) {
    for (const member of project.team) {
      const fullMember = teamMembers.find((m) => m.id === member.memberId);
      assignments.push({
        projectId: project.id,
        projectName: project.projectName,
        eventDate: project.date,
        memberId: member.memberId,
        memberName: member.name || fullMember?.name || 'Anggota Tim',
        role: member.role || fullMember?.role || 'Staff',
        fee: member.fee || 0,
        isPaid: false,
      });
      if (assignments.length >= limit) break;
    }
    if (assignments.length >= limit) break;
  }

  return assignments;
};

/**
 * Calculate full summary for dashboard header and KPI cards
 */
export const calculateDashboardSummary = (
  projects: Project[] = [],
  clients: Client[] = [],
  transactions: Transaction[] = [],
  cards: Card[] = [],
  safeTotals?: DashboardTotals,
  teamProjectPayments: TeamProjectPayment[] = [],
  referenceDate: Date = new Date()
): DashboardSummary => {
  const now = new Date(referenceDate);
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const eventsThisMonth = projects.filter((p) => {
    if (!p.date) return false;
    const d = new Date(p.date);
    return (
      !Number.isNaN(d.getTime()) &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    );
  }).length;

  let incomeThisMonth = 0;
  let expenseThisMonth = 0;

  transactions.forEach((t) => {
    if (!t.date) return;
    const d = new Date(t.date);
    if (
      !Number.isNaN(d.getTime()) &&
      d.getMonth() === currentMonth &&
      d.getFullYear() === currentYear
    ) {
      if (t.type === TransactionType.INCOME) {
        incomeThisMonth += Number(t.amount) || 0;
      } else if (t.type === TransactionType.EXPENSE) {
        expenseThisMonth += Number(t.amount) || 0;
      }
    }
  });

  const unpaidInvoicesProjects = projects.filter(
    (p) => p.paymentStatus !== PaymentStatus.LUNAS && p.status !== 'Dibatalkan'
  );
  const unpaidInvoices = unpaidInvoicesProjects.length;

  const totalUnpaidReceivables = unpaidInvoicesProjects.reduce((sum, p) => {
    const cost = Number(p.totalCost) || 0;
    const paid = Number(p.amountPaid) || 0;
    return sum + Math.max(0, cost - paid);
  }, 0);

  const totalUnpaidTeamHonor = teamProjectPayments
    .filter((p) => p.status === 'Unpaid')
    .reduce((sum, p) => sum + (Number(p.fee) || 0), 0);

  const tasks = getPendingAndOverdueTasks(projects, referenceDate);
  const pendingTasksCount = tasks.length;
  const overdueTasksCount = tasks.filter((t) => t.isOverdue).length;

  const totalBalance = cards.reduce((sum, c) => sum + (Number(c.balance) || 0), 0);

  const activeProjectsCount =
    safeTotals && safeTotals.activeProjects > 0
      ? safeTotals.activeProjects
      : projects.filter((p) => p.status !== 'Selesai' && p.status !== 'Dibatalkan').length;

  const activeClientsCount =
    safeTotals && safeTotals.activeClients > 0
      ? safeTotals.activeClients
      : clients.filter(
          (c) =>
            c.status === ClientStatus.ACTIVE ||
            projects.some(
              (p) =>
                p.clientId === c.id &&
                p.status !== 'Selesai' &&
                p.status !== 'Dibatalkan'
            )
        ).length;

  const totalTeamMembersCount =
    safeTotals && safeTotals.teamMembers > 0 ? safeTotals.teamMembers : 0;

  return {
    totalBalance,
    activeProjects: activeProjectsCount,
    activeClients: activeClientsCount,
    totalTeamMembers: totalTeamMembersCount,
    eventsThisMonth,
    incomeThisMonth,
    expenseThisMonth,
    unpaidInvoices,
    totalUnpaidReceivables,
    totalUnpaidTeamHonor,
    pendingTasksCount,
    overdueTasksCount,
  };
};

/**
 * Generate monthly, yearly, or projection financial chart data
 */
export const getFinancialChartData = (
  transactions: Transaction[] = [],
  projects: Project[] = [],
  chartView: 'monthly' | 'yearly' | 'projection' = 'monthly',
  referenceDate: Date = new Date()
): ChartDataPoint[] => {
  const currentYear = referenceDate.getFullYear();

  if (chartView === 'yearly') {
    const totals: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const year = new Date(t.date).getFullYear().toString();
      if (!totals[year]) totals[year] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) totals[year].income += Number(t.amount) || 0;
      else totals[year].expense += Number(t.amount) || 0;
    });

    return Object.entries(totals)
      .sort(([yearA], [yearB]) => parseInt(yearA, 10) - parseInt(yearB, 10))
      .map(([year, values]) => ({
        name: year,
        isProjected: false,
        projectedReceivables: 0,
        ...values,
      }));
  }

  if (chartView === 'projection') {
    const monthlyTotals: Record<string, { income: number; expense: number }> = {};
    transactions.forEach((t) => {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyTotals[key]) monthlyTotals[key] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) monthlyTotals[key].income += Number(t.amount) || 0;
      else if (t.type === TransactionType.EXPENSE) monthlyTotals[key].expense += Number(t.amount) || 0;
    });

    const histValues = Object.values(monthlyTotals);
    const avgIncome =
      histValues.length > 0
        ? Math.round(histValues.reduce((s, v) => s + v.income, 0) / histValues.length)
        : 0;
    const avgExpense =
      histValues.length > 0
        ? Math.round(histValues.reduce((s, v) => s + v.expense, 0) / histValues.length)
        : 0;

    const projList: ChartDataPoint[] = [];
    for (let i = 0; i < 6; i++) {
      const target = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + i, 1);
      const targetYear = target.getFullYear();
      const targetMonth = target.getMonth();
      const monthName = target.toLocaleString('id-ID', { month: 'short', year: '2-digit' });

      const monthProjects = projects.filter((p) => {
        const pDate = new Date(p.date || p.deadlineDate || '');
        return (
          !Number.isNaN(pDate.getTime()) &&
          pDate.getFullYear() === targetYear &&
          pDate.getMonth() === targetMonth
        );
      });

      const receivables = monthProjects.reduce((sum, p) => {
        const cost = Number(p.totalCost) || 0;
        const paid = Number(p.amountPaid) || 0;
        return sum + Math.max(0, cost - paid);
      }, 0);

      projList.push({
        name: `${monthName}${i === 0 ? ' (Kini)' : ''}`,
        income: avgIncome + receivables,
        expense: avgExpense,
        isProjected: true,
        projectedReceivables: receivables,
      });
    }

    return projList;
  }

  // Monthly breakdown for current year
  const data: ChartDataPoint[] = MONTH_NAMES_ID.map((month) => ({
    name: month,
    income: 0,
    expense: 0,
    isProjected: false,
    projectedReceivables: 0,
  }));

  transactions.forEach((t) => {
    const d = new Date(t.date);
    if (!Number.isNaN(d.getTime()) && d.getFullYear() === currentYear) {
      const m = d.getMonth();
      if (m >= 0 && m < 12) {
        if (t.type === TransactionType.INCOME) {
          data[m].income += Number(t.amount) || 0;
        } else {
          data[m].expense += Number(t.amount) || 0;
        }
      }
    }
  });

  return data;
};

/**
 * Calculate business health indicators (Revenue, Expense, Margin)
 */
export const getFinancialHealth = (
  transactions: Transaction[] = [],
  referenceDate: Date = new Date()
) => {
  const currentMonth = referenceDate.getMonth();
  const currentYear = referenceDate.getFullYear();

  const monthTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    const d = new Date(t.date);
    return (
      !Number.isNaN(d.getTime()) &&
      d.getFullYear() === currentYear &&
      d.getMonth() === currentMonth
    );
  });

  const monthlyRevenue = monthTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const monthlyExpense = monthTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const margin = monthlyRevenue > 0 ? ((monthlyRevenue - monthlyExpense) / monthlyRevenue) * 100 : 0;

  return {
    monthlyRevenue,
    monthlyExpense,
    margin,
  };
};

/**
 * Calculate lead source and funnel conversion statistics
 */
export const getLeadMetrics = (leads: Lead[] = []) => {
  const totalLeads = leads.length;
  const channelCounts: Record<string, number> = {};

  leads.forEach((l) => {
    const channel = l.contactChannel || 'Lainnya';
    channelCounts[channel] = (channelCounts[channel] || 0) + 1;
  });

  const sourceData = Object.entries(channelCounts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalLeads > 0 ? (count / totalLeads) * 100 : 0,
    }));

  const discussionCount = leads.filter(
    (l) => l.status === LeadStatus.DISCUSSION || l.status === LeadStatus.CONVERTED
  ).length;
  const convertedCount = leads.filter((l) => l.status === LeadStatus.CONVERTED).length;
  const followUpCount = leads.filter((l) => l.status === LeadStatus.FOLLOW_UP).length;

  const funnel = [
    { label: 'Total Leads', count: totalLeads, color: 'bg-blue-600' },
    { label: 'Diskusi', count: discussionCount, color: 'bg-cyan-600' },
    { label: 'Converted', count: convertedCount, color: 'bg-green-600' },
  ];

  const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

  return {
    totalLeads,
    sourceData,
    funnel,
    conversionRate,
    discussionCount,
    convertedCount,
    followUpCount,
  };
};

/**
 * Calculate package distribution
 */
export const getPackageDistribution = (projects: Project[] = [], limit = 5) => {
  const counts: Record<string, number> = {};
  projects.forEach((p) => {
    const pkgName = p.packageName || 'Tanpa Paket';
    counts[pkgName] = (counts[pkgName] || 0) + 1;
  });

  const total = projects.length || 1;
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([name, count]) => ({
      name,
      count,
      percentage: (count / total) * 100,
    }));
};

/**
 * Calculate client satisfaction score
 */
export const getClientSatisfaction = (feedback: ClientFeedback[] = []) => {
  const totalFeedback = feedback.length;
  const avgRating =
    totalFeedback > 0 ? feedback.reduce((sum, f) => sum + (f.rating || 0), 0) / totalFeedback : 0;
  return {
    totalFeedback,
    avgRating,
  };
};
