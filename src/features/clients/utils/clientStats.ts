import {
  Client,
  Project,
  Package,
  ClientType,
  ClientsTotals,
  ClientStatsSummary,
  ClientWithSummary,
  LedgerProject,
  LedgerExpenseGroup,
} from '../types';
import { formatCurrency } from '../../../utils/currency';

export function computeClientSummaryStats(
  allClientData: ClientWithSummary[],
  totals: ClientsTotals
): ClientStatsSummary {
  const totalReceivables = allClientData.reduce((sum, c) => sum + c.balanceDue, 0);
  const locationCounts: Record<string, number> = {};
  allClientData.forEach(c => {
    c.projects.forEach(p => {
      if (p.location) {
        locationCounts[p.location] = (locationCounts[p.location] || 0) + 1;
      }
    });
  });
  const topLocationEntry = Object.entries(locationCounts).sort(([, a], [, b]) => b - a)[0];
  const mostFrequentLocation = topLocationEntry ? topLocationEntry[0] : '-';

  return {
    activeClients: totals.activeClients,
    totalReceivables: formatCurrency(totalReceivables),
    totalClients: totals.clients,
    mostFrequentLocation,
  };
}

export type ClientTransactionTotals = {
  income: number;
  expense: number;
  expenses: { projectId: string; label: string; amount: number }[];
};

export const buildClientLedger = (
  client: Client,
  projects: Project[],
  packages: Package[],
  transactionTotals: ClientTransactionTotals
) => {
  const isDirect = !client.clientType || (client.clientType as string) === ClientType.DIRECT;
  const clientProjects = projects.filter(project => project.clientId === client.id);
  const totalVal = clientProjects.reduce((sum, project) => sum + project.totalCost, 0);

  const projectCostDetails: LedgerProject[] = clientProjects.map(project => {
    const selectedAddOns = (project.addOns || []).filter(item => item && (item.name || item.id));
    const packageIds = new Set(packages.map(packageItem => packageItem.id));
    const additionalPackages = project.additionalPackages?.length
      ? project.additionalPackages
      : selectedAddOns.filter(item => item.id && packageIds.has(item.id) && item.id !== project.packageId);
    const additionalPackageIds = new Set(additionalPackages.map(item => item.id));
    const regularAddOns = selectedAddOns.filter(
      item => (!item.id || !packageIds.has(item.id)) && !additionalPackageIds.has(item.id)
    );
    const customCosts = project.customCosts || [];
    const customCostTotal = customCosts.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const additionalPackageTotal = additionalPackages.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const addOnTotal = regularAddOns.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const transportCost = Number(project.transportCost) || 0;
    const printingCost = Number(project.printingCost) || 0;
    const primaryPackageTotal =
      project.totalCost - customCostTotal - additionalPackageTotal - addOnTotal - transportCost - printingCost;

    const items = [
      { label: `Paket utama · ${project.packageName || 'Paket'}`, amount: primaryPackageTotal },
      ...additionalPackages.map(item => ({
        label: `Paket tambahan · ${item.name || packages.find(packageItem => packageItem.id === item.id)?.name || 'Paket'}`,
        amount: Number(item.price) || 0,
      })),
      ...regularAddOns.map(item => ({ label: `Add-on · ${item.name || 'Tambahan'}`, amount: Number(item.price) || 0 })),
      ...(printingCost > 0 ? [{ label: 'Produksi fisik', amount: printingCost }] : []),
      ...(transportCost > 0 ? [{ label: 'Transport', amount: transportCost }] : []),
      ...customCosts.map(item => ({ label: item.description || 'Biaya tambahan', amount: Number(item.amount) || 0 })),
    ];
    return {
      id: project.id,
      name: project.projectName || project.packageName || 'Acara',
      total: project.totalCost,
      items,
    };
  });

  const projectNameById = new Map(projectCostDetails.map(item => [item.id, item.name]));
  const cleanExpenseLabel = (label: string, projectId: string) => {
    const projectName = projectNameById.get(projectId);
    if (!projectName) return label;
    const suffix = `(${projectName})`;
    const trimmed = label.trim();
    if (!trimmed.endsWith(suffix)) return label;
    return trimmed.slice(0, -suffix.length).replace(/[\s\-–—]+$/, '').trim() || label;
  };

  const grouped = new Map<string, LedgerExpenseGroup>();
  transactionTotals.expenses.forEach(item => {
    const entry = grouped.get(item.projectId) || {
      id: item.projectId,
      name: projectNameById.get(item.projectId) || 'Acara',
      total: 0,
      items: [],
    };
    entry.items.push({
      label: cleanExpenseLabel(item.label, item.projectId),
      amount: item.amount,
    });
    entry.total += item.amount;
    grouped.set(item.projectId, entry);
  });

  const eventDates = clientProjects
    .map(project => project.date)
    .filter((date): date is string => Boolean(date))
    .sort((left, right) => left.localeCompare(right));

  const netProfit = transactionTotals.income - transactionTotals.expense;
  const netProfitMargin = transactionTotals.income > 0 ? (netProfit / transactionTotals.income) * 100 : 0;

  return {
    isDirect,
    totalVal,
    eventDates,
    projectCostDetails,
    expenseByProject: Array.from(grouped.values()),
    expenseGroups: Array.from(grouped.values()),
    expenseTotal: transactionTotals.expense,
    netProfit,
    netProfitMargin,
    payStatus: clientProjects[0]?.paymentStatus || '-',
  };
};
