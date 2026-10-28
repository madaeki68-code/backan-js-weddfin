import React from 'react';
import {
  Kanban,
  Table,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  PlusIcon,
  Share2Icon,
  EyeIcon,
} from '../../../constants';
import { ContactChannel, LeadStatus } from '../../../types';
import type { LeadCardFilter, LeadViewMode } from '../types/leads.types';

export interface LeadsToolbarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  cityFilter: string;
  setCityFilter: (city: string) => void;
  uniqueCities: string[];
  sourceFilter: ContactChannel | 'all';
  setSourceFilter: (source: ContactChannel | 'all') => void;
  leadSourceOptions: string[];
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  viewMode: LeadViewMode;
  setViewMode: (mode: LeadViewMode) => void;
  mobileFiltersOpen: boolean;
  setMobileFiltersOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeLeadFilterCount: number;
  activeCardFilter: LeadCardFilter | null;
  setActiveCardFilter: (filter: LeadCardFilter | null) => void;
  hiddenColumns: Set<LeadStatus>;
  toggleHiddenColumns: () => void;
  onAddLead: () => void;
  onOpenShareModal?: () => void;
  totalCount: number;
}

export const LeadsToolbar: React.FC<LeadsToolbarProps> = ({
  searchTerm,
  setSearchTerm,
  cityFilter,
  setCityFilter,
  uniqueCities,
  sourceFilter,
  setSourceFilter,
  leadSourceOptions,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  viewMode,
  setViewMode,
  mobileFiltersOpen,
  setMobileFiltersOpen,
  activeLeadFilterCount,
  activeCardFilter,
  setActiveCardFilter,
  hiddenColumns,
  toggleHiddenColumns,
  onAddLead,
  onOpenShareModal,
  totalCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Active Quick Card Filter Banner */}
      {activeCardFilter && (
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-[#5D87FF]/10 border border-[#5D87FF]/30 rounded-xl text-xs text-[#2348C7] shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-[#5D87FF] animate-pulse shrink-0" />
            <span className="font-bold truncate">
              Filter Aktif dari Kartu: {activeCardFilter.label}
            </span>
            <span className="text-[#5A6A85] text-[11px] shrink-0 font-medium">
              ({totalCount} Calon Pengantin ditampilkan)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActiveCardFilter(null)}
            className="text-xs font-bold text-[#2348C7] hover:underline shrink-0 px-2.5 py-1 rounded-lg hover:bg-white/70 transition-colors cursor-pointer"
          >
            Hapus Filter &times;
          </button>
        </div>
      )}

      {/* ── Filter Bar ──────────────────────────────────────────────── */}
      <div className="bg-brand-surface p-3 md:p-4 rounded-xl shadow-lg border border-brand-border flex flex-col gap-3 md:gap-4 leads-filter-section">
        {/* Mobile Top Row: Search + Filter Toggle + Add Button */}
        <div className="flex sm:hidden items-center gap-2 w-full">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field !rounded-xl !border !bg-brand-bg px-3 py-2 text-xs flex-1 min-w-0"
            placeholder="Cari Calon Pengantin / Kota..."
          />
          <button
            type="button"
            onClick={() => setMobileFiltersOpen((prev) => !prev)}
            className={`inline-flex items-center gap-1 px-2.5 py-2 rounded-xl border text-xs font-semibold transition-colors flex-shrink-0 ${
              mobileFiltersOpen || activeLeadFilterCount > 0
                ? 'bg-[#5D87FF]/10 border-[#5D87FF]/30 text-[#5D87FF]'
                : 'bg-brand-bg border-brand-border text-brand-text-primary'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filter</span>
            {activeLeadFilterCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#5D87FF] text-white text-[10px] font-bold">
                {activeLeadFilterCount}
              </span>
            )}
            {mobileFiltersOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          <button
            type="button"
            onClick={onAddLead}
            className="button-primary px-3 py-2 inline-flex items-center justify-center gap-1 text-xs font-semibold flex-shrink-0 !rounded-xl"
            title="Tambah Calon Pengantin Manual"
          >
            <PlusIcon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Tambah</span>
          </button>
        </div>

        {/* Desktop Search + City + Source row (or mobile expanded) */}
        <div
          className={`${
            mobileFiltersOpen ? 'flex' : 'hidden sm:flex'
          } flex-col sm:flex-row sm:items-center gap-2 w-full`}
        >
          <div className="hidden sm:block flex-1 min-w-0 !mt-0">
            <input
              type="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field !h-10 !min-h-0 !rounded-lg !border !bg-brand-bg px-3 text-sm placeholder:text-[#5A6A85] placeholder:opacity-100 w-full"
              placeholder="Cari Calon Pengantin / Kota / Catatan..."
            />
          </div>
          <select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            className="input-field !h-10 !min-h-0 !rounded-lg !border !bg-brand-bg px-3 py-1 text-xs sm:text-sm w-full sm:w-44"
          >
            <option value="all">Semua Kota ({uniqueCities.length})</option>
            {uniqueCities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value as ContactChannel | 'all')}
            className="input-field !h-10 !min-h-0 !rounded-lg !border !bg-brand-bg px-3 py-1 text-xs sm:text-sm w-full sm:w-44 leads-source-filter"
          >
            <option value="all">Semua Sumber</option>
            {leadSourceOptions.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div
          className={`${
            mobileFiltersOpen ? 'flex' : 'hidden sm:flex'
          } flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 w-full leads-filter-row`}
        >
          <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field !h-10 !min-h-0 !rounded-lg !border !bg-brand-bg px-2.5 py-1.5 text-xs sm:text-sm w-full"
              title="Dari tanggal"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field !h-10 !min-h-0 !rounded-lg !border !bg-brand-bg px-2.5 py-1.5 text-xs sm:text-sm w-full"
              title="Sampai tanggal"
            />
          </div>
          <div className="flex items-center justify-end gap-2 w-full sm:w-auto leads-filter-buttons">
            {/* View toggle */}
            <div className="flex rounded-lg border border-brand-border overflow-hidden flex-shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('kanban')}
                className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'kanban'
                    ? 'bg-brand-accent text-white'
                    : 'bg-brand-bg text-brand-text-secondary hover:bg-brand-border'
                }`}
                title="Tampilan Kanban"
              >
                <Kanban className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Kanban</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-xs font-semibold transition-colors flex items-center gap-1 ${
                  viewMode === 'table'
                    ? 'bg-brand-accent text-white'
                    : 'bg-brand-bg text-brand-text-secondary hover:bg-brand-border'
                }`}
                title="Tampilan Tabel"
              >
                <Table className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tabel</span>
              </button>
            </div>
            {viewMode === 'kanban' && (
              <button
                type="button"
                onClick={toggleHiddenColumns}
                className="button-secondary min-h-[35px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 sm:py-2 inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm font-semibold"
                title={
                  hiddenColumns.has(LeadStatus.CONVERTED)
                    ? 'Tampilkan Kolom Selesai'
                    : 'Sembunyikan Kolom Selesai'
                }
              >
                <EyeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="inline sm:hidden lg:inline">
                  {hiddenColumns.has(LeadStatus.CONVERTED) ? 'Tampil' : 'Kolom'}
                </span>
              </button>
            )}
            {onOpenShareModal && (
              <button
                type="button"
                onClick={onOpenShareModal}
                className="button-secondary min-h-[35px] sm:min-h-[40px] px-2.5 sm:px-3 py-1.5 sm:py-2 inline-flex items-center justify-center gap-1.5 flex-1 sm:flex-none text-xs sm:text-sm font-semibold"
                title="Bagikan Form Calon Pengantin"
              >
                <Share2Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="inline sm:hidden">Share</span>
              </button>
            )}
            <button
              type="button"
              onClick={onAddLead}
              className="hidden sm:inline-flex button-primary min-h-[40px] px-3 py-2 items-center justify-center gap-1.5 text-sm font-semibold"
              title="Tambah Calon Pengantin Manual"
            >
              <PlusIcon className="w-4 h-4 flex-shrink-0" />
              <span>Tambah</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
