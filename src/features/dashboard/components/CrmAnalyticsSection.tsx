import React from 'react';
import { Lead, Project, ClientFeedback, ViewType, NavigationAction } from '../../../types';
import { UsersIcon } from '../../../constants';
import { MobileCollapsibleSection } from '../../../components/ui/MobileProgressiveDisclosure';
import { LeadSourceWidget } from './LeadSourceWidget';
import { ConversionFunnelWidget } from './ConversionFunnelWidget';
import { PackageDistributionWidget } from './PackageDistributionWidget';
import { LatestLeadsWidget } from './LatestLeadsWidget';
import { ClientSatisfactionWidget } from './ClientSatisfactionWidget';
import { TeamAssignmentsWidget } from './TeamAssignmentsWidget';
import { UpcomingTeamAssignment } from '../types';

interface CrmAnalyticsSectionProps {
  leads: Lead[];
  projects: Project[];
  leadMetrics: {
    totalLeads: number;
    sourceData: { name: string; count: number; percentage: number }[];
    funnel: { label: string; count: number; color: string }[];
  };
  packageDistribution: { name: string; count: number; percentage: number }[];
  latestLeads: Lead[];
  clientSatisfaction: { totalFeedback: number; avgRating: number };
  upcomingTeamAssignments: UpcomingTeamAssignment[];
  totalUnpaidHonor: number;
  onNavigate: (view: ViewType, action?: NavigationAction) => void;
  onOpenPaymentsModal: () => void;
}

export const CrmAnalyticsSection: React.FC<CrmAnalyticsSectionProps> = ({
  leads,
  projects,
  leadMetrics,
  packageDistribution,
  latestLeads,
  clientSatisfaction,
  upcomingTeamAssignments,
  totalUnpaidHonor,
  onNavigate,
  onOpenPaymentsModal,
}) => {
  return (
    <MobileCollapsibleSection
      title="Pipeline Pengantin & Analitik Penjualan"
      subtitle={`${leads.length} prospek · ${projects.length} acara`}
      variant="stats"
      actionLabelOpen="Lihat Analitik"
      actionLabelClose="Tutup"
    >
      <div className="space-y-3">
        <div className="hidden md:flex items-center gap-2">
          <UsersIcon className="w-4 h-4 text-brand-accent" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#5A6A85]">
            Pipeline Pengantin & Penjualan
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          <div className="col-span-1">
            <LeadSourceWidget
              sources={leadMetrics.sourceData}
              totalLeads={leadMetrics.totalLeads}
            />
          </div>
          <div className="col-span-1">
            <ConversionFunnelWidget
              funnel={leadMetrics.funnel}
              totalLeads={leadMetrics.totalLeads}
            />
          </div>
          <div className="col-span-1">
            <PackageDistributionWidget distribution={packageDistribution} />
          </div>
          <div className="col-span-1">
            <LatestLeadsWidget leads={latestLeads} onNavigate={onNavigate} />
          </div>
          <div className="col-span-1">
            <ClientSatisfactionWidget
              totalFeedback={clientSatisfaction.totalFeedback}
              avgRating={clientSatisfaction.avgRating}
              onNavigate={onNavigate}
            />
          </div>
          <div className="col-span-1">
            <TeamAssignmentsWidget
              assignments={upcomingTeamAssignments}
              totalUnpaidHonor={totalUnpaidHonor}
              onNavigate={onNavigate}
              onOpenPaymentsModal={onOpenPaymentsModal}
            />
          </div>
        </div>
      </div>
    </MobileCollapsibleSection>
  );
};
