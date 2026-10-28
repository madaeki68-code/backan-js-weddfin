import React from 'react';
import { ModernStatCard } from '../../../components/modernize/ModernStatCard';
import {
  UsersIcon,
  MapPinIcon,
  PackageIcon,
  BriefcaseIcon,
  TargetIcon,
  StarIcon,
} from '../../../constants';
import { formatCurrency } from '../../clients/utils/clientFormatters';
import {
  TypeReportStats,
  CityStat,
  PackageStat,
  TeamStat,
  LeadConversionStat,
  SatisfactionStats,
  StatModalType,
} from '../types/businessReports.types';

interface ReportsSummaryCardsProps {
  totalClients: number;
  typeStats: TypeReportStats;
  topCity: CityStat;
  topPackage: PackageStat;
  topTeamJob: TeamStat;
  topTeamPayment: TeamStat;
  leadConversionStats: LeadConversionStat;
  satisfactionStats: SatisfactionStats;
  onOpenStatModal: (modal: StatModalType) => void;
}

export const ReportsSummaryCards: React.FC<ReportsSummaryCardsProps> = ({
  totalClients,
  typeStats,
  topCity,
  topPackage,
  topTeamJob,
  topTeamPayment,
  leadConversionStats,
  satisfactionStats,
  onOpenStatModal,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Pengantin */}
      <ModernStatCard
        title="Total Pengantin"
        value={String(totalClients)}
        subtitle={`${typeStats.typeReportProjects.length} Acara Pernikahan`}
        icon={<UsersIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('total')}
      />

      {/* 2. Langsungan vs Vendor */}
      <ModernStatCard
        title="Langsungan vs Vendor"
        value={`${typeStats.typeReportDirectShare}% : ${typeStats.typeReportVendorShare}%`}
        subtitle={`Omzet: ${formatCurrency(typeStats.typeReportRevenue)}`}
        icon={<UsersIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('direct-vendor')}
      />

      {/* 3. Kota Terbanyak */}
      <ModernStatCard
        title="Daerah / Kota Terbanyak"
        value={topCity.name}
        subtitle={`${topCity.clientCount} Pengantin (${topCity.percentage.toFixed(0)}%)`}
        icon={<MapPinIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('top-cities')}
      />

      {/* 4. Paket Terlaris */}
      <ModernStatCard
        title="Paket Terlaris"
        value={topPackage.name}
        subtitle={`${topPackage.orderCount}x Dipesan (${topPackage.revenueContribution.toFixed(0)}% Omzet)`}
        icon={<PackageIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('top-packages')}
      />

      {/* 5. Top Tim & Kru */}
      <ModernStatCard
        title="Kinerja Tim & Vendor"
        value={topTeamJob.name}
        subtitle={`${topTeamJob.jobCount} Job (${topTeamJob.role})`}
        icon={<BriefcaseIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('top-team')}
      />

      {/* 6. Konversi Calon Pengantin */}
      <ModernStatCard
        title="Konversi Calon Pengantin"
        value={`${leadConversionStats.rate}%`}
        subtitle={`${leadConversionStats.converted} Closing dari ${leadConversionStats.total} Leads`}
        icon={<TargetIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('lead-conversion')}
      />

      {/* 7. Kepuasan Pengantin */}
      <ModernStatCard
        title="Kepuasan Pengantin"
        value={`${satisfactionStats.avgRating} / 5.0`}
        subtitle="Rata-rata Rating Ulasan"
        icon={<StarIcon className="w-5 h-5" />}
        onClick={() => onOpenStatModal('very-satisfied')}
      />
    </div>
  );
};

export default ReportsSummaryCards;
