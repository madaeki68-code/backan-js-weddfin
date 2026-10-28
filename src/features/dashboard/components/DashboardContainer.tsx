import React from 'react';
import { DashboardProps } from '../types';
import { useDashboard } from '../hooks';
import { DashboardHeader } from './DashboardHeader';
import { DashboardKpiCards } from './DashboardKpiCards';
import { DashboardAlertBar } from './DashboardAlertBar';
import { OperationalAgendaSection } from './OperationalAgendaSection';
import { FinancialSection } from './FinancialSection';
import { CrmAnalyticsSection } from './CrmAnalyticsSection';
import { DashboardModals } from './DashboardModals';

export const DashboardContainer: React.FC<DashboardProps> = (props) => {
  const {
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
    activeModal,
    chartView,
    dashboardTitle,
    dashboardSubtitle,
    openModal,
    closeModal,
    setChartView,
    navigateTo,
  } = useDashboard(props);

  return (
    <div className="space-y-3 sm:space-y-6">
      {/* 1. Command Center Quick Action Header */}
      <DashboardHeader
        title={dashboardTitle}
        subtitle={dashboardSubtitle}
        onNavigate={navigateTo}
      />

      {/* 2. Four Core Primary Vital KPI Cards */}
      <DashboardKpiCards summary={summary} onOpenModal={openModal} />

      {/* 3. Action Alert Bar (Operational Signals) */}
      <DashboardAlertBar
        summary={summary}
        onNavigate={navigateTo}
        onOpenModal={openModal}
      />

      {/* 4. Section 1: Operasional & Agenda */}
      <OperationalAgendaSection
        events={upcomingEvents}
        projects={projects}
        pendingTasks={pendingTasks}
        projectStatusConfig={projectStatusConfig}
        onNavigate={navigateTo}
        onOpenAllTasksModal={() => openModal('tasks')}
      />

      {/* 5. Section 2: Kesehatan Finansial & Kas */}
      <FinancialSection
        cards={cards}
        transactions={props.transactions || []}
        projects={projects}
        chartData={chartData}
        chartView={chartView}
        onChangeChartView={setChartView}
        financialHealth={financialHealth}
        latestTransactions={latestTransactions}
        onNavigate={navigateTo}
      />

      {/* 6. Section 3: CRM, Penjualan & Tim */}
      <CrmAnalyticsSection
        leads={props.leads || []}
        projects={projects}
        leadMetrics={leadMetrics}
        packageDistribution={packageDistribution}
        latestLeads={latestLeads}
        clientSatisfaction={clientSatisfaction}
        upcomingTeamAssignments={upcomingTeamAssignments}
        totalUnpaidHonor={summary.totalUnpaidTeamHonor}
        onNavigate={navigateTo}
        onOpenPaymentsModal={() => openModal('payments')}
      />

      {/* 7. Drilldown Modals */}
      <DashboardModals
        activeModal={activeModal}
        onClose={closeModal}
        cards={cards}
        pockets={pockets}
        projects={projects}
        clients={clients}
        teamMembers={teamMembers}
        activeProjectsList={activeProjectsList}
        activeClientsList={activeClientsList}
        unpaidTeamPaymentsList={unpaidTeamPaymentsList}
        pendingTasks={pendingTasks}
        projectStatusConfig={projectStatusConfig}
        totalBalance={summary.totalBalance}
        totalActiveProjects={summary.activeProjects}
        totalActiveClients={summary.activeClients}
        totalTeamMembers={summary.totalTeamMembers}
        onNavigate={navigateTo}
      />
    </div>
  );
};

export default DashboardContainer;
