import { useState, useMemo, useCallback } from 'react';
import { ViewType, NavigationAction, ClientStatus } from '../../../types';
import { useUiTextOverrides, customizeUiText } from '../../../utils/uiTextCustomization';
import {
  DashboardProps,
  DashboardModalType,
} from '../types';
import { EMPTY_DASHBOARD_TOTALS } from '../constants';
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
} from '../utils';

export const useDashboard = (props: DashboardProps) => {
  const {
    projects = [],
    clients = [],
    transactions = [],
    teamMembers = [],
    cards = [],
    pockets = [],
    handleNavigation,
    leads = [],
    teamProjectPayments = [],
    clientFeedback = [],
    projectStatusConfig = [],
    profile,
    totals,
  } = props;

  const uiTextOverrides = useUiTextOverrides();
  const [activeModal, setActiveModal] = useState<DashboardModalType>(null);
  const [chartView, setChartView] = useState<'monthly' | 'yearly' | 'projection'>('monthly');

  const safeTotals = totals ?? EMPTY_DASHBOARD_TOTALS;

  // Memoized Summary Metrics
  const summary = useMemo(() => {
    return calculateDashboardSummary(
      projects,
      clients,
      transactions,
      cards,
      safeTotals,
      teamProjectPayments
    );
  }, [projects, clients, transactions, cards, safeTotals, teamProjectPayments]);

  // Upcoming Events
  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(projects);
  }, [projects]);

  // Pending & Overdue Tasks
  const pendingTasks = useMemo(() => {
    return getPendingAndOverdueTasks(projects);
  }, [projects]);

  // Upcoming Team Assignments
  const upcomingTeamAssignments = useMemo(() => {
    return getUpcomingTeamAssignments(projects, teamMembers);
  }, [projects, teamMembers]);

  // Financial Chart Data
  const chartData = useMemo(() => {
    return getFinancialChartData(transactions, projects, chartView);
  }, [transactions, projects, chartView]);

  // Business Health Metrics
  const financialHealth = useMemo(() => {
    return getFinancialHealth(transactions);
  }, [transactions]);

  // CRM & Lead Metrics
  const leadMetrics = useMemo(() => {
    return getLeadMetrics(leads);
  }, [leads]);

  // Package Distribution
  const packageDistribution = useMemo(() => {
    return getPackageDistribution(projects);
  }, [projects]);

  // Client Satisfaction
  const clientSatisfaction = useMemo(() => {
    return getClientSatisfaction(clientFeedback);
  }, [clientFeedback]);

  // Active Projects list for modals
  const activeProjectsList = useMemo(() => {
    return projects.filter((p) => p.status !== 'Selesai' && p.status !== 'Dibatalkan');
  }, [projects]);

  // Active Clients list for modals
  const activeClientsList = useMemo(() => {
    return clients.filter(
      (c) =>
        c.status === ClientStatus.ACTIVE ||
        projects.some(
          (p) => p.clientId === c.id && p.status !== 'Selesai' && p.status !== 'Dibatalkan'
        )
    );
  }, [clients, projects]);

  // Unpaid Team Payments list
  const unpaidTeamPaymentsList = useMemo(() => {
    return teamProjectPayments.filter((p) => p.status === 'Unpaid');
  }, [teamProjectPayments]);

  // Latest Transactions (top 5)
  const latestTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => {
        const dateDifference = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (dateDifference !== 0) return dateDifference;
        return (
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
        );
      })
      .slice(0, 5);
  }, [transactions]);

  // Latest Leads (top 5)
  const latestLeads = useMemo(() => {
    return [...leads]
      .sort(
        (a, b) =>
          new Date(b.createdAt || b.date).getTime() -
          new Date(a.createdAt || a.date).getTime()
      )
      .slice(0, 5);
  }, [leads]);

  // Modal handlers
  const openModal = useCallback((modal: DashboardModalType) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  // Safe navigation wrapper
  const navigateTo = useCallback(
    (view: ViewType, action?: NavigationAction) => {
      handleNavigation(view, action);
    },
    [handleNavigation]
  );

  // Studio Display Name
  const studioName = profile?.companyName || 'Studio';
  const dashboardTitle = customizeUiText('dashboard.title', '{companyName} Dashboard', uiTextOverrides)
    .replaceAll('{companyName}', studioName);
  const dashboardSubtitle = customizeUiText(
    'dashboard.subtitle',
    'Pusat kendali operasional, agenda pernikahan, dan kesehatan finansial studio.',
    uiTextOverrides
  );

  return {
    // Data & Calculations
    summary,
    upcomingEvents,
    pendingTasks,
    upcomingTeamAssignments,
    chartData,
    financialHealth,
    leadMetrics,
    packageDistribution,
    clientSatisfaction,
    activeProjectsList,
    activeClientsList,
    unpaidTeamPaymentsList,
    latestTransactions,
    latestLeads,
    projectStatusConfig,
    cards,
    pockets,
    teamMembers,
    projects,
    clients,

    // UI state
    activeModal,
    chartView,
    studioName,
    dashboardTitle,
    dashboardSubtitle,

    // Action methods
    openModal,
    closeModal,
    setChartView,
    navigateTo,
  };
};
