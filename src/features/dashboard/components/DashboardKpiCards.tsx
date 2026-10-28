import React from 'react';
import { DollarSignIcon, TrendingUpIcon, FolderKanbanIcon, UsersIcon } from '../../../constants';
import { ModernStatCard } from '../../../components/modernize';
import { formatCurrency } from '../utils';
import { DashboardSummary, DashboardModalType } from '../types';

interface DashboardKpiCardsProps {
  summary: DashboardSummary;
  onOpenModal: (modal: DashboardModalType) => void;
}

export const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  summary,
  onOpenModal,
}) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
      <ModernStatCard
        icon={<DollarSignIcon className="w-6 h-6" />}
        title="Total Saldo Kas & Bank"
        value={formatCurrency(summary.totalBalance)}
        subtitle="Saldo semua kartu & kas tunai"
        iconColorVariant="primary"
        compactOnMobile
        onClick={() => onOpenModal('balance')}
      />
      <ModernStatCard
        icon={<TrendingUpIcon className="w-6 h-6" />}
        title="Pendapatan Bulan Ini"
        value={formatCurrency(summary.incomeThisMonth)}
        valueClassName="!text-[#166534]"
        subtitle="Pemasukan yang tercatat bulan ini"
        iconColorVariant="success"
        compactOnMobile
      />
      <ModernStatCard
        icon={<FolderKanbanIcon className="w-6 h-6" />}
        title="Acara Aktif"
        value={summary.activeProjects.toString()}
        subtitle="Project sedang berjalan"
        iconColorVariant="secondary"
        compactOnMobile
        onClick={() => onOpenModal('projects')}
      />
      <ModernStatCard
        icon={<UsersIcon className="w-6 h-6" />}
        title="Pengantin Aktif"
        value={summary.activeClients.toString()}
        subtitle="Pengantin dengan acara berjalan"
        iconColorVariant="warning"
        compactOnMobile
        onClick={() => onOpenModal('clients')}
      />
    </div>
  );
};
