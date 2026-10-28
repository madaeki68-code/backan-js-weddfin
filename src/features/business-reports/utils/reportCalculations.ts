import {
  Client,
  Lead,
  Project,
  ClientType,
  TeamMember,
  Package,
  Transaction,
  TransactionType,
  PaymentStatus,
  LeadStatus,
  SatisfactionLevel,
  ClientFeedback,
} from '../../../types';
import { resolveLeadStatus } from '../../../constants';
import { generateUUID } from '../../../utils/uuid';
import { extractCityFromAddress } from '../../clients/utils/clientFormatters';
import {
  CityStat,
  PackageStat,
  TeamStat,
  LeadConversionStat,
  TypeReportStats,
  SatisfactionStats,
} from '../types/businessReports.types';

/**
 * Filter list based on date bounds
 */
export function filterItemsByDate<T extends Record<string, any>>(
  items: T[],
  dateFrom: string,
  dateTo: string,
  primaryDateKey: string = 'date'
): T[] {
  if (!dateFrom && !dateTo) return items;
  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;
  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);

  return items.filter(item => {
    const rawVal =
      item[primaryDateKey] || item['createdAt'] || item['date'] || item['since'];
    if (!rawVal) return true;
    const d = new Date(rawVal);
    if (isNaN(d.getTime())) return true;
    return (!from || d >= from) && (!to || d <= to);
  });
}

/**
 * Filter projects by project date
 */
export function filterProjectsByDate(
  projects: Project[],
  dateFrom: string,
  dateTo: string
): Project[] {
  if (!dateFrom && !dateTo) return projects;
  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;
  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);

  return projects.filter(p => {
    const rawDate = p.date || (p as any).createdAt;
    if (!rawDate) return false;
    const d = new Date(rawDate);
    if (isNaN(d.getTime())) return false;
    return (!from || d >= from) && (!to || d <= to);
  });
}

/**
 * Calculate Direct vs Vendor client statistics
 */
export function calculateTypeReportStats(
  clients: Client[],
  filteredClients: Client[],
  filteredProjects: Project[],
  dateFrom: string,
  dateTo: string
): TypeReportStats {
  const typeReportClients =
    !dateFrom && !dateTo
      ? filteredClients
      : (() => {
          const projectClientIds = new Set(filteredProjects.map(p => p.clientId));
          return clients.filter(c => projectClientIds.has(c.id));
        })();

  const typeReportDirectClients = typeReportClients.filter(
    c => !c.clientType || (c.clientType as string) === ClientType.DIRECT
  );
  const typeReportVendorClients = typeReportClients.filter(
    c => (c.clientType as string) === ClientType.VENDOR
  );

  const typeReportClientIds = new Set(typeReportClients.map(c => c.id));
  const typeReportProjects = filteredProjects.filter(p => typeReportClientIds.has(p.clientId));

  const typeReportDirectIds = new Set(typeReportDirectClients.map(c => c.id));
  const typeReportVendorIds = new Set(typeReportVendorClients.map(c => c.id));

  const typeReportDirectProjects = typeReportProjects.filter(p => typeReportDirectIds.has(p.clientId));
  const typeReportVendorProjects = typeReportProjects.filter(p => typeReportVendorIds.has(p.clientId));

  const typeReportDirectRevenue = typeReportDirectProjects.reduce((sum, p) => sum + p.totalCost, 0);
  const typeReportVendorRevenue = typeReportVendorProjects.reduce((sum, p) => sum + p.totalCost, 0);
  const typeReportRevenue = typeReportProjects.reduce((sum, p) => sum + p.totalCost, 0);

  const typeReportAvgDirectRevenue = typeReportDirectClients.length
    ? Math.round(typeReportDirectRevenue / typeReportDirectClients.length)
    : 0;
  const typeReportAvgVendorRevenue = typeReportVendorClients.length
    ? Math.round(typeReportVendorRevenue / typeReportVendorClients.length)
    : 0;
  const typeReportAvgRevenuePerClient = typeReportClients.length
    ? Math.round(typeReportRevenue / typeReportClients.length)
    : 0;

  const typeReportDirectShare = typeReportClients.length
    ? ((typeReportDirectClients.length / typeReportClients.length) * 100).toFixed(0)
    : '0';
  const typeReportVendorShare = typeReportClients.length
    ? ((typeReportVendorClients.length / typeReportClients.length) * 100).toFixed(0)
    : '0';

  const typeReportDirectRevenueShare = typeReportRevenue
    ? ((typeReportDirectRevenue / typeReportRevenue) * 100).toFixed(1)
    : '0';
  const typeReportVendorRevenueShare = typeReportRevenue
    ? ((typeReportVendorRevenue / typeReportRevenue) * 100).toFixed(1)
    : '0';

  return {
    typeReportClients,
    typeReportDirectClients,
    typeReportVendorClients,
    typeReportProjects,
    typeReportDirectProjects,
    typeReportVendorProjects,
    typeReportDirectRevenue,
    typeReportVendorRevenue,
    typeReportRevenue,
    typeReportAvgDirectRevenue,
    typeReportAvgVendorRevenue,
    typeReportAvgRevenuePerClient,
    typeReportDirectShare,
    typeReportVendorShare,
    typeReportDirectRevenueShare,
    typeReportVendorRevenueShare,
  };
}

/**
 * Calculate geographical city & region distribution
 */
export function calculateCityStats(
  cityReportClients: Client[],
  filteredLeads: Lead[],
  filteredProjects: Project[]
): CityStat[] {
  const map: Record<
    string,
    {
      name: string;
      clientCount: number;
      leadCount: number;
      projectCount: number;
      totalRevenue: number;
      clients: Client[];
      leads: Lead[];
    }
  > = {};

  cityReportClients.forEach(c => {
    const city = extractCityFromAddress(c.address || c.homeAddress || '');
    if (!map[city]) {
      map[city] = {
        name: city,
        clientCount: 0,
        leadCount: 0,
        projectCount: 0,
        totalRevenue: 0,
        clients: [],
        leads: [],
      };
    }
    map[city].clientCount += 1;
    map[city].clients.push(c);
  });

  filteredLeads.forEach(l => {
    const city = extractCityFromAddress(l.location || l.address || '');
    if (!map[city]) {
      map[city] = {
        name: city,
        clientCount: 0,
        leadCount: 0,
        projectCount: 0,
        totalRevenue: 0,
        clients: [],
        leads: [],
      };
    }
    map[city].leadCount += 1;
    map[city].leads.push(l);
  });

  filteredProjects.forEach(p => {
    const client = cityReportClients.find(c => c.id === p.clientId);
    const targetCity = client
      ? extractCityFromAddress(client.address || client.homeAddress || '')
      : extractCityFromAddress(p.location || '');
    if (map[targetCity]) {
      map[targetCity].projectCount += 1;
      map[targetCity].totalRevenue += p.totalCost;
    }
  });

  const list = Object.values(map).sort((a, b) => {
    if (b.clientCount !== a.clientCount) return b.clientCount - a.clientCount;
    const aTotal = a.clientCount + a.leadCount;
    const bTotal = b.clientCount + b.leadCount;
    if (bTotal !== aTotal) return bTotal - aTotal;
    return b.totalRevenue - a.totalRevenue;
  });

  const totalCount = cityReportClients.length;
  return list.map(item => ({
    ...item,
    percentage:
      totalCount > 0
        ? (item.clientCount / totalCount) * 100
        : item.leadCount > 0
        ? 100
        : 0,
  }));
}

/**
 * Calculate package sales and revenue contributions
 */
export function calculatePackageStats(
  packages: Package[],
  filteredProjects: Project[],
  totalRevenue: number,
  hasDateFilter: boolean
): PackageStat[] {
  const map: Record<
    string,
    {
      name: string;
      category: string;
      region: string;
      pricelistPrice: number;
      orderCount: number;
      totalOmzet: number;
      projects: Project[];
    }
  > = {};

  (packages || []).forEach(pkg => {
    map[pkg.name] = {
      name: pkg.name,
      category: pkg.category || 'Pernikahan',
      region: pkg.region || '-',
      pricelistPrice: pkg.price || 0,
      orderCount: 0,
      totalOmzet: 0,
      projects: [],
    };
  });

  filteredProjects.forEach(p => {
    const pName = p.packageName?.trim() || 'Paket Standar';
    if (!map[pName]) {
      map[pName] = {
        name: pName,
        category: p.projectType || 'Pernikahan',
        region: p.location || '-',
        pricelistPrice: p.unitPrice || p.totalCost || 0,
        orderCount: 0,
        totalOmzet: 0,
        projects: [],
      };
    } else if (map[pName].region === '-' && p.location) {
      map[pName].region = p.location;
    }
    map[pName].orderCount += 1;
    map[pName].totalOmzet += p.totalCost;
    map[pName].projects.push(p);
  });

  return Object.values(map)
    .filter(item => (hasDateFilter ? item.orderCount > 0 : true))
    .map(item => ({
      ...item,
      avgRealizedPrice:
        item.orderCount > 0 ? Math.round(item.totalOmzet / item.orderCount) : item.pricelistPrice,
      revenueContribution: totalRevenue > 0 ? (item.totalOmzet / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) =>
      b.orderCount !== a.orderCount ? b.orderCount - a.orderCount : b.totalOmzet - a.totalOmzet
    );
}

/**
 * Calculate team job assignments and honorarium
 */
export function calculateTeamStats(
  teamMembers: TeamMember[],
  filteredProjects: Project[]
): TeamStat[] {
  const memberMap: Record<string, TeamStat> = {};

  (teamMembers || []).forEach(tm => {
    memberMap[tm.name.toLowerCase().trim()] = {
      id: tm.id,
      name: tm.name,
      role: tm.role || 'Crew',
      category: tm.category || 'Tim',
      jobCount: 0,
      totalFee: 0,
      paidFee: 0,
      unpaidFee: 0,
      projects: [],
    };
  });

  filteredProjects.forEach(p => {
    if (p.team && Array.isArray(p.team)) {
      p.team.forEach(assigned => {
        const key = assigned.name.toLowerCase().trim();
        if (!memberMap[key]) {
          memberMap[key] = {
            id: assigned.memberId || generateUUID(),
            name: assigned.name,
            role: assigned.role || 'Crew',
            category: 'Tim',
            jobCount: 0,
            totalFee: 0,
            paidFee: 0,
            unpaidFee: 0,
            projects: [],
          };
        }
        const fee = Number(assigned.fee) || 0;
        memberMap[key].jobCount += 1;
        memberMap[key].totalFee += fee;
        const isPaid = p.paymentStatus === PaymentStatus.LUNAS;
        if (isPaid) {
          memberMap[key].paidFee += fee;
        } else {
          memberMap[key].unpaidFee += fee;
        }
        memberMap[key].projects.push({
          project: p,
          fee,
          role: assigned.role || memberMap[key].role,
        });
      });
    }
  });

  return Object.values(memberMap).filter(item => item.jobCount > 0);
}

/**
 * Calculate Lead conversion funnel & channel statistics
 */
export function calculateLeadConversionStats(filteredLeads: Lead[]): LeadConversionStat {
  const total = filteredLeads.length;
  const converted = filteredLeads.filter(l => resolveLeadStatus(l) === LeadStatus.CONVERTED).length;
  const discussion = filteredLeads.filter(l => resolveLeadStatus(l) === LeadStatus.DISCUSSION).length;
  const followUp = filteredLeads.filter(l => resolveLeadStatus(l) === LeadStatus.FOLLOW_UP).length;
  const rejected = filteredLeads.filter(l => resolveLeadStatus(l) === LeadStatus.REJECTED).length;
  const rate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0';

  const channelMap: Record<string, { channel: string; total: number; converted: number }> = {};
  filteredLeads.forEach(l => {
    const ch = l.contactChannel || 'Lainnya';
    if (!channelMap[ch]) channelMap[ch] = { channel: ch, total: 0, converted: 0 };
    channelMap[ch].total += 1;
    if (resolveLeadStatus(l) === LeadStatus.CONVERTED) channelMap[ch].converted += 1;
  });

  const channels = Object.values(channelMap)
    .sort((a, b) => b.total - a.total)
    .map(ch => ({
      ...ch,
      rate: ch.total > 0 ? ((ch.converted / ch.total) * 100).toFixed(0) : '0',
    }));

  return { total, converted, discussion, followUp, rejected, rate, channels };
}

/**
 * Calculate client feedback and satisfaction ratings
 */
export function calculateSatisfactionStats(feedback: ClientFeedback[]): SatisfactionStats {
  const bySatisfaction = feedback.reduce((acc, item) => {
    if (!acc[item.satisfaction]) acc[item.satisfaction] = [];
    acc[item.satisfaction].push(item);
    return acc;
  }, {} as Record<SatisfactionLevel, ClientFeedback[]>);

  const counts: Record<SatisfactionLevel, number> = {
    [SatisfactionLevel.VERY_SATISFIED]: (bySatisfaction[SatisfactionLevel.VERY_SATISFIED] || []).length,
    [SatisfactionLevel.SATISFIED]: (bySatisfaction[SatisfactionLevel.SATISFIED] || []).length,
    [SatisfactionLevel.NEUTRAL]: (bySatisfaction[SatisfactionLevel.NEUTRAL] || []).length,
    [SatisfactionLevel.UNSATISFIED]: (bySatisfaction[SatisfactionLevel.UNSATISFIED] || []).length,
  };

  const avgRating =
    feedback.length > 0
      ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1)
      : '0.0';

  return { bySatisfaction, counts, avgRating };
}

/**
 * Calculate transaction totals grouped by client
 */
export function calculateClientTransactionTotals(
  transactions: Transaction[],
  projectClientIds: Map<string, string>
): Map<string, { income: number; expense: number; expenses: { projectId: string; label: string; amount: number }[] }> {
  const totals = new Map<
    string,
    { income: number; expense: number; expenses: { projectId: string; label: string; amount: number }[] }
  >();

  transactions.forEach(transaction => {
    if (!transaction.projectId) return;
    const clientId = projectClientIds.get(transaction.projectId);
    if (!clientId) return;
    const clientTotals = totals.get(clientId) || { income: 0, expense: 0, expenses: [] };
    if (transaction.type === TransactionType.EXPENSE) {
      clientTotals.expense += transaction.amount;
      clientTotals.expenses.push({
        projectId: transaction.projectId,
        label: transaction.description || transaction.category || 'Pengeluaran',
        amount: transaction.amount,
      });
    } else if (transaction.type === TransactionType.INCOME) {
      clientTotals.income += transaction.amount;
    }
    totals.set(clientId, clientTotals);
  });

  return totals;
}
