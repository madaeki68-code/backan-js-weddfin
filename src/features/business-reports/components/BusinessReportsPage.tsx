import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { SatisfactionLevel } from '../../../types';
import { useBusinessReports } from '../hooks/useBusinessReports';
import { BusinessReportsProps, ReportTab } from '../types/businessReports.types';
import ReportsHeader from './ReportsHeader';
import ReportsFilters from './ReportsFilters';
import ReportsSummaryCards from './ReportsSummaryCards';
import SourceReport from './SourceReport';
import CityReport from './CityReport';
import PackageReport from './PackageReport';
import TeamReport from './TeamReport';
import ConversionReport from './ConversionReport';
import SatisfactionReport from './SatisfactionReport';
import ReportsStatModal from './ReportsStatModal';

export const BusinessReportsPage: React.FC<BusinessReportsProps> = ({
  clients,
  leads,
  projects,
  feedback,
  setFeedback,
  showNotification,
  handleNavigation,
  teamMembers = [],
  packages = [],
  transactions = [],
  profile = null,
}) => {
  const reports = useBusinessReports({
    clients,
    leads,
    projects,
    feedback,
    teamMembers,
    packages,
    transactions,
    profile,
    showNotification,
  });

  const feedbackFormUrl = `${window.location.origin}${window.location.pathname}#/feedback`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(feedbackFormUrl).then(
      () => {
        showNotification('Tautan berhasil disalin!');
        reports.setIsShareModalOpen(false);
      },
      () => alert('Gagal menyalin tautan.')
    );
  };

  const handleManualFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reports.manualFeedbackForm.clientName.trim() || !reports.manualFeedbackForm.feedback.trim()) {
      showNotification('Nama pengantin dan isi ulasan harus diisi.');
      return;
    }

    let satLevel = SatisfactionLevel.VERY_SATISFIED;
    if (reports.manualFeedbackForm.rating === 4) satLevel = SatisfactionLevel.SATISFIED;
    else if (reports.manualFeedbackForm.rating === 3) satLevel = SatisfactionLevel.NEUTRAL;
    else if (reports.manualFeedbackForm.rating <= 2) satLevel = SatisfactionLevel.UNSATISFIED;

    const newFeedback = {
      id: `fb-${Date.now()}`,
      clientName: reports.manualFeedbackForm.clientName.trim(),
      rating: reports.manualFeedbackForm.rating,
      feedback: reports.manualFeedbackForm.feedback.trim(),
      satisfaction: satLevel,
      date: new Date().toISOString().split('T')[0],
    };

    setFeedback(prev => [newFeedback, ...prev]);
    showNotification('Ulasan pengantin berhasil ditambahkan.');
    reports.setIsFeedbackModalOpen(false);
    reports.setManualFeedbackForm({ clientName: '', rating: 5, feedback: '' });
  };

  const reportTabs: { key: ReportTab; label: string; count?: number }[] = [
    { key: 'tipe', label: 'Langsungan vs Vendor' },
    { key: 'daerah', label: 'Daerah & Kota', count: reports.cityStats.length },
    { key: 'paket', label: 'Paket & Pricelist', count: reports.packageStats.length },
    { key: 'tim', label: 'Performa Tim', count: reports.teamStats.length },
    { key: 'leads', label: 'Leads & Konversi' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <ReportsHeader
        isExportingPdf={reports.isExportingPdf}
        onDownloadPdf={reports.handleDownloadPdf}
        onExportCsv={reports.handleExportCsv}
        onOpenFeedbackModal={() => reports.setIsFeedbackModalOpen(true)}
        onOpenShareModal={() => reports.setIsShareModalOpen(true)}
      />

      {/* ── Date Filters Toolbar ────────────────────────────────────────── */}
      <ReportsFilters
        monthFilter={reports.filters.monthFilter}
        dateFrom={reports.filters.dateFrom}
        dateTo={reports.filters.dateTo}
        activePreset={reports.filters.activePreset}
        reportPeriodLabel={reports.filters.reportPeriodLabel}
        onSetPreset={reports.filters.handleSetDatePreset}
        onMonthChange={reports.filters.handleMonthChange}
        onDateChange={reports.filters.handleDateChange}
      />

      {/* ── Summary Stat Cards ──────────────────────────────────────────── */}
      <ReportsSummaryCards
        totalClients={reports.filteredClients.length}
        typeStats={reports.typeStats}
        topCity={reports.topCity}
        topPackage={reports.topPackage}
        topTeamJob={reports.topTeamJob}
        topTeamPayment={reports.topTeamPayment}
        leadConversionStats={reports.leadConversionStats}
        satisfactionStats={reports.satisfactionStats}
        onOpenStatModal={reports.setActiveStatModal}
      />

      {/* ── Segmented Tab Switcher for Deep Dive Reports ────────────────── */}
      <div className="flex items-center gap-1.5 p-1.5 bg-brand-surface rounded-2xl border border-brand-border overflow-x-auto no-scrollbar">
        {reportTabs.map(tab => {
          const isActive = reports.activeReportTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => reports.setActiveReportTab(tab.key)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-brand-accent text-white shadow-xs'
                  : 'text-brand-text-secondary hover:text-brand-text-primary hover:bg-brand-bg'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 text-[10px] font-extrabold rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-brand-bg text-brand-text-secondary'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active Tab View ─────────────────────────────────────────────── */}
      <div className="animate-fade-in">
        {reports.activeReportTab === 'tipe' && (
          <SourceReport
            typeStats={reports.typeStats}
            filteredProjects={reports.filteredProjects}
            packages={packages}
            clientTransactionTotals={reports.clientTransactionTotals}
            typeReportClientTableTotals={reports.typeReportClientTableTotals}
            paginatedClients={reports.paginatedClients}
            totalTableClients={reports.typeReportClientsInTable.length}
            currentPage={reports.filters.currentPage}
            itemsPerPage={reports.filters.itemsPerPage}
            totalPages={reports.totalPages}
            onPageChange={reports.filters.setCurrentPage}
            viewMode={reports.filters.viewMode}
            onViewModeChange={reports.filters.setViewMode}
            searchQuery={reports.filters.searchQuery}
            onSearchChange={reports.filters.setSearchQuery}
            sortBy={reports.filters.sortBy}
            onSortChange={reports.filters.setSortBy}
            clientTypeFilter={reports.filters.clientTypeFilter}
            onClientTypeFilterChange={reports.filters.setClientTypeFilter}
            statusFilter={reports.filters.statusFilter}
            onStatusFilterChange={reports.filters.setStatusFilter}
          />
        )}

        {reports.activeReportTab === 'daerah' && (
          <CityReport
            cityStats={reports.cityStats}
            cityTableTotals={reports.cityTableTotals}
          />
        )}

        {reports.activeReportTab === 'paket' && (
          <PackageReport
            packageStats={reports.packageStats}
            packageTableTotals={reports.packageTableTotals}
            totalRevenue={reports.typeStats.typeReportRevenue}
          />
        )}

        {reports.activeReportTab === 'tim' && (
          <TeamReport
            teamStats={reports.teamStats}
            teamTableTotals={reports.teamTableTotals}
          />
        )}

        {reports.activeReportTab === 'leads' && (
          <ConversionReport leadConversionStats={reports.leadConversionStats} />
        )}
      </div>

      {/* ── Satisfaction & Feedback Section ─────────────────────────────── */}
      <SatisfactionReport
        feedback={reports.filteredFeedback}
        satisfactionStats={reports.satisfactionStats}
        onOpenFeedbackModal={() => reports.setIsFeedbackModalOpen(true)}
        onOpenShareModal={() => reports.setIsShareModalOpen(true)}
      />

      {/* ── Stat Deep Dive Modal ───────────────────────────────────────── */}
      <ReportsStatModal
        activeStatModal={reports.activeStatModal}
        onClose={() => reports.setActiveStatModal(null)}
        clients={clients}
        filteredProjects={reports.filteredProjects}
        typeStats={reports.typeStats}
        cityStats={reports.cityStats}
        packageStats={reports.packageStats}
        teamStats={reports.teamStats}
        leadConversionStats={reports.leadConversionStats}
        feedback={reports.filteredFeedback}
      />

      {/* ── Modal Tulis Ulasan Manual ───────────────────────────────────── */}
      {reports.isFeedbackModalOpen && (
        <Modal
          isOpen={reports.isFeedbackModalOpen}
          onClose={() => reports.setIsFeedbackModalOpen(false)}
          title="Tulis Ulasan & Testimoni Pengantin"
          size="md"
        >
          <form onSubmit={handleManualFeedbackSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-brand-text-secondary mb-1">
                Nama Pengantin *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Romeo & Juliet"
                value={reports.manualFeedbackForm.clientName}
                onChange={e =>
                  reports.setManualFeedbackForm(prev => ({ ...prev, clientName: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-brand-text-primary text-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-brand-text-secondary mb-1">
                Rating Bintang Kepuasan *
              </label>
              <select
                value={reports.manualFeedbackForm.rating}
                onChange={e =>
                  reports.setManualFeedbackForm(prev => ({ ...prev, rating: Number(e.target.value) }))
                }
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-brand-text-primary text-xs"
              >
                <option value={5}>⭐⭐⭐⭐⭐ 5 Star - Sangat Puas</option>
                <option value={4}>⭐⭐⭐⭐ 4 Star - Puas</option>
                <option value={3}>⭐⭐⭐ 3 Star - Cukup / Netral</option>
                <option value={2}>⭐⭐ 2 Star - Kurang Puas</option>
                <option value={1}>⭐ 1 Star - Kecewa</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-brand-text-secondary mb-1">
                Isi Testimoni / Catatan Ulasan *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Apresiasi, masukan, atau pengalaman pengantin..."
                value={reports.manualFeedbackForm.feedback}
                onChange={e =>
                  reports.setManualFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-xl border border-brand-border bg-brand-bg text-brand-text-primary text-xs resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-brand-border/60">
              <button
                type="button"
                onClick={() => reports.setIsFeedbackModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-border text-brand-text-secondary font-bold hover:bg-brand-bg"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-bold cursor-pointer"
              >
                Simpan Ulasan
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Modal Bagikan Link Form Testimoni ───────────────────────────── */}
      {reports.isShareModalOpen && (
        <Modal
          isOpen={reports.isShareModalOpen}
          onClose={() => reports.setIsShareModalOpen(false)}
          title="Bagikan Tautan Form Ulasan Pengantin"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <p className="text-brand-text-secondary leading-relaxed">
              Kirimkan tautan formulir ulasan ini kepada pengantin setelah acara selesai untuk mengumpulkan testimoni dan rating secara otomatis.
            </p>

            <div className="p-3 rounded-xl bg-brand-bg border border-brand-border font-mono text-[11px] break-all select-all text-brand-text-primary">
              {feedbackFormUrl}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => reports.setIsShareModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-brand-border text-brand-text-secondary font-bold hover:bg-brand-bg"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={copyToClipboard}
                className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white font-bold cursor-pointer"
              >
                Salin Tautan
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BusinessReportsPage;
