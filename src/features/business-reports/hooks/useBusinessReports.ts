import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  Client,
  Lead,
  Project,
  ClientFeedback,
  TeamMember,
  Package,
  Transaction,
  Profile,
  ClientType,
} from '../../../types';
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
import { exportClientsReportToCsv, exportExecutiveReportPdf } from '../utils/reportExport';
import { useReportFilters } from './useReportFilters';
import { ReportTab, StatModalType } from '../types/businessReports.types';
import { extractCityFromAddress } from '../../clients/utils/clientFormatters';

export interface UseBusinessReportsParams {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  feedback: ClientFeedback[];
  teamMembers?: TeamMember[];
  packages?: Package[];
  transactions?: Transaction[];
  profile?: Profile | null;
  showNotification: (msg: string) => void;
}

export function useBusinessReports({
  clients,
  leads,
  projects,
  feedback,
  teamMembers = [],
  packages = [],
  transactions = [],
  profile = null,
  showNotification,
}: UseBusinessReportsParams) {
  const filters = useReportFilters();

  const [activeReportTab, setActiveReportTab] = useState<ReportTab>('tipe');
  const [activeStatModal, setActiveStatModal] = useState<StatModalType>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [manualFeedbackForm, setManualFeedbackForm] = useState({ clientName: '', rating: 5, feedback: '' });

  // 1. Filtered base datasets
  const filteredLeads = useMemo(
    () => filterItemsByDate(leads, filters.dateFrom, filters.dateTo, 'date'),
    [leads, filters.dateFrom, filters.dateTo]
  );

  const filteredClients = useMemo(
    () => filterItemsByDate(clients, filters.dateFrom, filters.dateTo, 'since'),
    [clients, filters.dateFrom, filters.dateTo]
  );

  const filteredProjects = useMemo(
    () => filterProjectsByDate(projects, filters.dateFrom, filters.dateTo),
    [projects, filters.dateFrom, filters.dateTo]
  );

  const filteredFeedback = useMemo(
    () => filterItemsByDate(feedback, filters.dateFrom, filters.dateTo, 'date'),
    [feedback, filters.dateFrom, filters.dateTo]
  );

  // 2. Direct vs Vendor Type Statistics
  const typeStats = useMemo(
    () =>
      calculateTypeReportStats(
        clients,
        filteredClients,
        filteredProjects,
        filters.dateFrom,
        filters.dateTo
      ),
    [clients, filteredClients, filteredProjects, filters.dateFrom, filters.dateTo]
  );

  // 3. City & Region Statistics
  const cityStats = useMemo(
    () => calculateCityStats(typeStats.typeReportClients, filteredLeads, filteredProjects),
    [typeStats.typeReportClients, filteredLeads, filteredProjects]
  );

  const topCity = useMemo(
    () =>
      cityStats.find(c => c.clientCount > 0) ||
      cityStats[0] || {
        name: 'Semua Kota',
        clientCount: 0,
        leadCount: 0,
        projectCount: 0,
        percentage: 0,
        totalRevenue: 0,
        clients: [] as Client[],
        leads: [] as Lead[],
      },
    [cityStats]
  );

  const cityTableTotals = useMemo(
    () =>
      cityStats.reduce(
        (totals, city) => ({
          clients: totals.clients + city.clientCount,
          leads: totals.leads + city.leadCount,
          projects: totals.projects + city.projectCount,
          revenue: totals.revenue + city.totalRevenue,
        }),
        { clients: 0, leads: 0, projects: 0, revenue: 0 }
      ),
    [cityStats]
  );

  // 4. Package Statistics
  const packageStats = useMemo(
    () =>
      calculatePackageStats(
        packages,
        filteredProjects,
        typeStats.typeReportRevenue,
        Boolean(filters.dateFrom || filters.dateTo)
      ),
    [packages, filteredProjects, typeStats.typeReportRevenue, filters.dateFrom, filters.dateTo]
  );

  const topPackage = useMemo(
    () =>
      packageStats[0] || {
        name: 'Belum Ada Paket',
        category: '-',
        region: '-',
        pricelistPrice: 0,
        orderCount: 0,
        totalOmzet: 0,
        avgRealizedPrice: 0,
        revenueContribution: 0,
        projects: [],
      },
    [packageStats]
  );

  const packageTableTotals = useMemo(
    () =>
      packageStats.reduce(
        (totals, pkg) => ({
          pricelist: totals.pricelist + pkg.pricelistPrice,
          orders: totals.orders + pkg.orderCount,
          revenue: totals.revenue + pkg.totalOmzet,
        }),
        { pricelist: 0, orders: 0, revenue: 0 }
      ),
    [packageStats]
  );

  // 5. Team Statistics
  const teamStats = useMemo(
    () => calculateTeamStats(teamMembers, filteredProjects),
    [teamMembers, filteredProjects]
  );

  const topTeamJob = useMemo(
    () =>
      [...teamStats].sort((a, b) => b.jobCount - a.jobCount)[0] || {
        id: '',
        name: 'Belum Ada',
        jobCount: 0,
        totalFee: 0,
        role: '-',
        category: 'Tim' as const,
        paidFee: 0,
        unpaidFee: 0,
        projects: [],
      },
    [teamStats]
  );

  const topTeamPayment = useMemo(
    () =>
      [...teamStats].sort((a, b) => b.totalFee - a.totalFee)[0] || {
        id: '',
        name: 'Belum Ada',
        jobCount: 0,
        totalFee: 0,
        role: '-',
        category: 'Tim' as const,
        paidFee: 0,
        unpaidFee: 0,
        projects: [],
      },
    [teamStats]
  );

  const teamTableTotals = useMemo(
    () =>
      teamStats.reduce(
        (totals, member) => ({
          jobs: totals.jobs + member.jobCount,
          fees: totals.fees + member.totalFee,
          paid: totals.paid + member.paidFee,
          unpaid: totals.unpaid + member.unpaidFee,
        }),
        { jobs: 0, fees: 0, paid: 0, unpaid: 0 }
      ),
    [teamStats]
  );

  // 6. Lead Conversion Funnel
  const leadConversionStats = useMemo(
    () => calculateLeadConversionStats(filteredLeads),
    [filteredLeads]
  );

  // 7. Satisfaction & Feedback
  const satisfactionStats = useMemo(
    () => calculateSatisfactionStats(filteredFeedback),
    [filteredFeedback]
  );

  // 8. Transaction & Ledger Totals
  const projectClientIds = useMemo(
    () => new Map(filteredProjects.map(project => [project.id, project.clientId])),
    [filteredProjects]
  );

  const clientTransactionTotals = useMemo(
    () => calculateClientTransactionTotals(transactions, projectClientIds),
    [transactions, projectClientIds]
  );

  // 9. Table Client Rows with filtering and sorting
  const typeReportClientsInTable = useMemo(() => {
    let result = [...typeStats.typeReportClients];
    if (filters.statusFilter !== 'all') {
      result = result.filter(c => c.status === filters.statusFilter);
    }
    if (filters.clientTypeFilter !== 'all') {
      result = result.filter(c => {
        const isDirect = !c.clientType || (c.clientType as string) === ClientType.DIRECT;
        return filters.clientTypeFilter === 'direct' ? isDirect : !isDirect;
      });
    }
    if (filters.cityFilter !== 'all') {
      result = result.filter(
        c => extractCityFromAddress(c.address || c.homeAddress || '') === filters.cityFilter
      );
    }
    if (filters.packageFilter !== 'all') {
      const matchingClientIds = new Set(
        filteredProjects
          .filter(
            project =>
              (project.packageName || '').toLowerCase().trim() ===
              filters.packageFilter.toLowerCase().trim()
          )
          .map(project => project.clientId)
      );
      result = result.filter(c => matchingClientIds.has(c.id));
    }
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          (c.address || c.homeAddress || '').toLowerCase().includes(query)
      );
    }

    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
          return new Date(b.since).getTime() - new Date(a.since).getTime();
        case 'value': {
          const aVal = filteredProjects
            .filter(p => p.clientId === a.id)
            .reduce((sum, p) => sum + p.totalCost, 0);
          const bVal = filteredProjects
            .filter(p => p.clientId === b.id)
            .reduce((sum, p) => sum + p.totalCost, 0);
          return bVal - aVal;
        }
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    return result;
  }, [
    typeStats.typeReportClients,
    filters.statusFilter,
    filters.clientTypeFilter,
    filters.cityFilter,
    filters.packageFilter,
    filters.searchQuery,
    filters.sortBy,
    filteredProjects,
  ]);

  const typeReportClientTableTotals = useMemo(() => {
    return typeReportClientsInTable.reduce(
      (totals, client) => {
        const projectValue = filteredProjects
          .filter(project => project.clientId === client.id)
          .reduce((sum, project) => sum + project.totalCost, 0);
        const transactionTotals = clientTransactionTotals.get(client.id) || {
          income: 0,
          expense: 0,
          expenses: [],
        };
        return {
          projectValue: totals.projectValue + projectValue,
          expense: totals.expense + transactionTotals.expense,
          netProfit: totals.netProfit + transactionTotals.income - transactionTotals.expense,
        };
      },
      { projectValue: 0, expense: 0, netProfit: 0 }
    );
  }, [typeReportClientsInTable, filteredProjects, clientTransactionTotals]);

  const totalPages = Math.ceil(typeReportClientsInTable.length / filters.itemsPerPage);

  useEffect(() => {
    const lastPage = Math.max(1, totalPages);
    if (filters.currentPage > lastPage) filters.setCurrentPage(lastPage);
    else if (filters.currentPage < 1) filters.setCurrentPage(1);
  }, [filters.currentPage, totalPages, filters]);

  const paginatedClients = useMemo(() => {
    const startIndex = (filters.currentPage - 1) * filters.itemsPerPage;
    return typeReportClientsInTable.slice(startIndex, startIndex + filters.itemsPerPage);
  }, [typeReportClientsInTable, filters.currentPage, filters.itemsPerPage]);

  // Actions
  const handleDownloadPdf = useCallback(async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      await exportExecutiveReportPdf({
        profile,
        reportPeriodLabel: filters.reportPeriodLabel,
        monthFilter: filters.monthFilter,
        clients,
        filteredClients,
        filteredProjects,
        packages,
        transactions,
        filteredLeads,
        totalRevenue: typeStats.typeReportRevenue,
        typeStats,
        cityStats,
        packageStats,
        teamStats,
        leadConversionStats,
        typeReportClientsInTable,
        clientTransactionTotals,
        typeReportClientTableTotals,
        cityTableTotals,
        packageTableTotals,
        teamTableTotals,
        showNotification,
      });
    } finally {
      setIsExportingPdf(false);
    }
  }, [
    isExportingPdf,
    profile,
    filters.reportPeriodLabel,
    filters.monthFilter,
    clients,
    filteredClients,
    filteredProjects,
    packages,
    transactions,
    filteredLeads,
    typeStats,
    cityStats,
    packageStats,
    teamStats,
    leadConversionStats,
    typeReportClientsInTable,
    clientTransactionTotals,
    typeReportClientTableTotals,
    cityTableTotals,
    packageTableTotals,
    teamTableTotals,
    showNotification,
  ]);

  const handleExportCsv = useCallback(() => {
    exportClientsReportToCsv(typeReportClientsInTable, filteredProjects, showNotification);
  }, [typeReportClientsInTable, filteredProjects, showNotification]);

  return {
    filters,
    activeReportTab,
    setActiveReportTab,
    activeStatModal,
    setActiveStatModal,
    isFeedbackModalOpen,
    setIsFeedbackModalOpen,
    isShareModalOpen,
    setIsShareModalOpen,
    isExportingPdf,
    manualFeedbackForm,
    setManualFeedbackForm,
    filteredLeads,
    filteredClients,
    filteredProjects,
    filteredFeedback,
    typeStats,
    cityStats,
    topCity,
    cityTableTotals,
    packageStats,
    topPackage,
    packageTableTotals,
    teamStats,
    topTeamJob,
    topTeamPayment,
    teamTableTotals,
    leadConversionStats,
    satisfactionStats,
    clientTransactionTotals,
    typeReportClientsInTable,
    typeReportClientTableTotals,
    paginatedClients,
    totalPages,
    handleDownloadPdf,
    handleExportCsv,
  };
}
