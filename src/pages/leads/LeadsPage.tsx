import React, { useState, useMemo } from 'react';
import {
  Lead,
  LeadStatus,
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  Card,
  FinancialPocket,
  PromoCode,
  NavigationAction,
  ViewType,
} from '../../types';
import {
  useLeadsData,
  useLeadFilters,
  useLeadModals,
  LeadsToolbar,
  LeadsKanban,
  LeadsTable,
  LeadsStatsCards,
  LeadFormModal,
  LeadConvertModal,
  LeadDetailModal,
  LeadShareModal,
  LeadsStatsModal,
  computeLeadStatsSummary,
  computeCityStats,
  computeEventMonthStats,
  computeSourceStats,
} from '../../features/leads';
import type { LeadStatViewMode, LeadsPageTotals } from '../../features/leads/types/leads.types';

export interface LeadsProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  packages: Package[];
  addOns: AddOn[];
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userProfile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  showNotification: (message: string, duration?: number) => void;
  cards: Card[];
  setCards: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  promoCodes: PromoCode[];
  setPromoCodes: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  handleNavigation?: (view: ViewType, action?: NavigationAction) => void;
  totals?: LeadsPageTotals;
  initialAction?: NavigationAction | null;
  setInitialAction?: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
}

export const Leads: React.FC<LeadsProps> = ({
  leads,
  setLeads,
  clients,
  setClients,
  projects,
  setProjects,
  packages,
  addOns,
  transactions,
  setTransactions,
  userProfile,
  setProfile,
  showNotification,
  cards,
  setCards,
  pockets,
  setPockets,
  promoCodes,
  setPromoCodes,
  initialAction,
  setInitialAction,
}) => {
  // Modal State Management Hook
  const modals = useLeadModals({
    leads,
    userProfile,
    initialAction,
    setInitialAction,
  });

  // Data Mutations & Drag-and-drop Hook
  const leadsData = useLeadsData({
    leads,
    setLeads,
    clients,
    setClients,
    projects,
    setProjects,
    packages,
    addOns,
    transactions,
    setTransactions,
    userProfile,
    showNotification,
    cards,
    setCards,
    pockets,
    setPockets,
    promoCodes,
    setPromoCodes,
    onOpenConvertModal: modals.openConvertModal,
  });

  // Filter, Search & View Mode Hook
  const filters = useLeadFilters({
    leads,
    userProfile,
  });

  // Aggregated Statistics (pure computed values)
  const [statCardView, setStatCardView] = useState<LeadStatViewMode>('insights');
  const statsSummary = useMemo(() => computeLeadStatsSummary(leads), [leads]);
  const cityStats = useMemo(() => computeCityStats(leads), [leads]);
  const eventMonthStats = useMemo(() => computeEventMonthStats(leads), [leads]);
  const sourceStats = useMemo(() => computeSourceStats(leads), [leads]);

  // Card click interaction: Quick Filter or Drilldown Modal
  const handleCardClick = (
    type:
      | 'city'
      | 'event_month'
      | 'source'
      | 'active'
      | 'converted'
      | 'all'
      | 'discussion'
      | 'followup'
      | 'rejected'
  ) => {
    if (type === 'city' && cityStats.hasData) {
      filters.setActiveCardFilter({
        type: 'city',
        label: cityStats.topCity,
        value: cityStats.topCity,
      });
    } else if (type === 'event_month' && eventMonthStats.hasData) {
      filters.setActiveCardFilter({
        type: 'event_month',
        label: eventMonthStats.topMonth,
        value: eventMonthStats.topMonth,
      });
    } else if (type === 'source' && sourceStats.hasData) {
      filters.setActiveCardFilter({
        type: 'source',
        label: sourceStats.topSource,
        value: sourceStats.topSource,
      });
    } else if (type === 'active') {
      filters.setActiveCardFilter({
        type: 'active',
        label: 'Perlu Tindakan (Diskusi & Follow Up)',
      });
    } else if (type === 'converted') {
      filters.setActiveCardFilter({
        type: 'converted',
        label: 'Prospek Dikonversi',
      });
    } else if (type === 'discussion') {
      modals.openStatsModal(
        'Calon Pengantin - Sedang Diskusi',
        leads.filter((l) => l.status === LeadStatus.DISCUSSION)
      );
    } else if (type === 'followup') {
      modals.openStatsModal(
        'Calon Pengantin - Menunggu Follow Up',
        leads.filter((l) => l.status === LeadStatus.FOLLOW_UP)
      );
    } else if (type === 'rejected') {
      modals.openStatsModal(
        'Calon Pengantin - Ditolak',
        leads.filter((l) => l.status === LeadStatus.REJECTED)
      );
    } else if (type === 'all') {
      filters.setActiveCardFilter(null);
    }
  };

  // Form submission handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await leadsData.handleSaveLead(
      modals.leadFormData,
      modals.formModalMode,
      modals.selectedLeadForEdit?.id
    );
    if (success) {
      modals.closeFormModal();
    }
  };

  // Convert submission handler
  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modals.selectedLeadForConvert) return;
    const success = await leadsData.handleConvertLead(
      modals.selectedLeadForConvert,
      modals.convertFormData
    );
    if (success) {
      modals.closeConvertModal();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header / Stats Cards */}
      <LeadsStatsCards
        statCardView={statCardView}
        setStatCardView={setStatCardView}
        activeCardFilter={filters.activeCardFilter}
        cityStats={cityStats}
        eventMonthStats={eventMonthStats}
        sourceStats={sourceStats}
        statsSummary={statsSummary}
        onCardClick={handleCardClick}
      />

      {/* Toolbar (Search, Filter, View Mode, Quick Add) */}
      <LeadsToolbar
        searchTerm={filters.searchTerm}
        setSearchTerm={filters.setSearchTerm}
        cityFilter={filters.cityFilter}
        setCityFilter={filters.setCityFilter}
        uniqueCities={filters.uniqueCities}
        sourceFilter={filters.sourceFilter}
        setSourceFilter={filters.setSourceFilter}
        leadSourceOptions={filters.leadSourceOptions}
        dateFrom={filters.dateFrom}
        setDateFrom={filters.setDateFrom}
        dateTo={filters.dateTo}
        setDateTo={filters.setDateTo}
        viewMode={filters.viewMode}
        setViewMode={filters.setViewMode}
        mobileFiltersOpen={filters.mobileFiltersOpen}
        setMobileFiltersOpen={filters.setMobileFiltersOpen}
        activeLeadFilterCount={filters.activeLeadFilterCount}
        activeCardFilter={filters.activeCardFilter}
        setActiveCardFilter={filters.setActiveCardFilter}
        hiddenColumns={filters.hiddenColumns}
        toggleHiddenColumns={filters.toggleHiddenColumns}
        onAddLead={modals.openAddModal}
        totalCount={filters.filteredLeads.length}
      />

      {/* Main Content: Kanban or Table */}
      {filters.viewMode === 'kanban' ? (
        <LeadsKanban
          paginatedLeads={filters.paginatedLeads}
          filteredLeads={filters.filteredLeads}
          hiddenColumns={filters.hiddenColumns}
          mobileStatusTab={filters.mobileStatusTab}
          setMobileStatusTab={filters.setMobileStatusTab}
          currentPage={filters.currentPage}
          itemsPerPage={filters.itemsPerPage}
          totalItems={filters.filteredLeads.length}
          onPageChange={filters.setCurrentPage}
          onItemsPerPageChange={filters.setItemsPerPage}
          onDragStart={leadsData.handleDragStart}
          onDragOver={leadsData.handleDragOver}
          onDrop={leadsData.handleDrop}
          onEdit={modals.openEditModal}
          onDelete={leadsData.handleDeleteLead}
          onNextStatus={leadsData.handleNextStatus}
          onMoveStatus={leadsData.handleStatusChange}
          onShare={(type, lead) => {
            if (type === 'package') {
              modals.openSharePackageModal(lead);
            } else {
              modals.openShareBookingModal(lead);
            }
          }}
          onViewDetail={modals.openDetailModal}
        />
      ) : (
        <LeadsTable
          leads={leads}
          filteredLeads={filters.filteredLeads}
          paginatedLeads={filters.paginatedLeads}
          currentPage={filters.currentPage}
          itemsPerPage={filters.itemsPerPage}
          totalItems={filters.filteredLeads.length}
          onPageChange={filters.setCurrentPage}
          onItemsPerPageChange={filters.setItemsPerPage}
          onViewLead={modals.openDetailModal}
          onEdit={modals.openEditModal}
          onDelete={leadsData.handleDeleteLead}
          onNextStatus={leadsData.handleNextStatus}
          onOpenConvertModal={modals.openConvertModal}
          onOpenShareModal={(type, lead) => {
            if (type === 'package') {
              modals.openSharePackageModal(lead);
            } else {
              modals.openShareBookingModal(lead);
            }
          }}
        />
      )}

      {/* Modals */}
      <LeadFormModal
        isOpen={modals.isFormModalOpen}
        onClose={modals.closeFormModal}
        modalMode={modals.formModalMode}
        formData={modals.leadFormData}
        handleFormChange={modals.handleFormChange}
        handleSubmit={handleFormSubmit}
        leadSources={filters.leadSourceOptions}
        isSubmitting={leadsData.isSubmitting}
      />

      <LeadConvertModal
        isOpen={modals.isConvertModalOpen}
        onClose={modals.closeConvertModal}
        formData={modals.convertFormData}
        setFormData={modals.setConvertFormData}
        handleFormChange={modals.handleConvertFormChange}
        handleSubmit={handleConvertSubmit}
        packages={packages}
        addOns={addOns}
        userProfile={userProfile}
        cards={cards}
        promoCodes={promoCodes}
        isSubmitting={leadsData.isSubmitting}
      />

      <LeadDetailModal
        isOpen={modals.isDetailModalOpen}
        onClose={modals.closeDetailModal}
        lead={modals.selectedLeadForDetail}
        onEdit={modals.openEditModal}
        onConvert={modals.openConvertModal}
        onSharePackage={modals.openSharePackageModal}
        onShareBooking={modals.openShareBookingModal}
      />

      <LeadShareModal
        isOpen={modals.isShareModalOpen}
        onClose={modals.closeShareModal}
        lead={modals.selectedLeadForShare}
        type={modals.shareType}
        userProfile={userProfile}
        setProfile={setProfile}
        showNotification={showNotification}
        publicPackagesUrl={`${window.location.origin}/#/public-packages`}
        publicBookingFormUrl={`${window.location.origin}/#/public-booking`}
      />

      <LeadsStatsModal
        isOpen={modals.statsModal.isOpen}
        onClose={modals.closeStatsModal}
        title={modals.statsModal.title}
        leads={modals.statsModal.leads}
        onSelectLead={modals.openDetailModal}
      />
    </div>
  );
};

export default Leads;
