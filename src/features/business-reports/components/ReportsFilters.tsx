import React from 'react';
import { MobileCollapsibleSection } from '../../../components/ui/MobileProgressiveDisclosure';
import { CalendarIcon } from '../../../constants';
import { ReportDatePreset } from '../types/businessReports.types';

interface ReportsFiltersProps {
  monthFilter: string;
  dateFrom: string;
  dateTo: string;
  activePreset: ReportDatePreset;
  reportPeriodLabel: string;
  onSetPreset: (preset: ReportDatePreset) => void;
  onMonthChange: (value: string) => void;
  onDateChange: (from: string, to: string) => void;
}

export const ReportsFilters: React.FC<ReportsFiltersProps> = ({
  monthFilter,
  dateFrom,
  dateTo,
  activePreset,
  reportPeriodLabel,
  onSetPreset,
  onMonthChange,
  onDateChange,
}) => {
  return (
    <MobileCollapsibleSection
      title={`Filter Periode: ${reportPeriodLabel}`}
      badge={activePreset !== 'all' || monthFilter ? 'Aktif' : undefined}
      defaultOpen={false}
      className="bg-brand-surface rounded-2xl border border-brand-border p-4 shadow-xs"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1 text-xs">
        {/* Preset Chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-brand-text-secondary font-semibold mr-1">Preset:</span>
          <button
            type="button"
            onClick={() => onSetPreset('this-month')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activePreset === 'this-month'
                ? 'bg-brand-accent text-white shadow-xs'
                : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text-primary border border-brand-border/60'
            }`}
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => onSetPreset('this-quarter')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activePreset === 'this-quarter'
                ? 'bg-brand-accent text-white shadow-xs'
                : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text-primary border border-brand-border/60'
            }`}
          >
            Triwulan Ini
          </button>
          <button
            type="button"
            onClick={() => onSetPreset('this-year')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activePreset === 'this-year'
                ? 'bg-brand-accent text-white shadow-xs'
                : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text-primary border border-brand-border/60'
            }`}
          >
            Tahun Ini
          </button>
          <button
            type="button"
            onClick={() => onSetPreset('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              activePreset === 'all' && !monthFilter && !dateFrom && !dateTo
                ? 'bg-brand-accent text-white shadow-xs'
                : 'bg-brand-bg text-brand-text-secondary hover:text-brand-text-primary border border-brand-border/60'
            }`}
          >
            Semua Periode
          </button>
        </div>

        {/* Inputs: Month & Custom Date Range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-brand-text-secondary font-semibold">Pilih Bulan:</span>
            <input
              type="month"
              value={monthFilter}
              onChange={e => onMonthChange(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-brand-text-primary text-xs outline-none focus:border-brand-accent"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-brand-text-secondary font-semibold">Rentang:</span>
            <input
              type="date"
              value={dateFrom}
              onChange={e => onDateChange(e.target.value, dateTo)}
              className="px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-brand-text-primary text-xs outline-none focus:border-brand-accent"
            />
            <span className="text-brand-text-secondary">-</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => onDateChange(dateFrom, e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-brand-bg border border-brand-border text-brand-text-primary text-xs outline-none focus:border-brand-accent"
            />
          </div>
        </div>
      </div>
    </MobileCollapsibleSection>
  );
};

export default ReportsFilters;
