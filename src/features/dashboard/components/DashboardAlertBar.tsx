import React from 'react';
import { ViewType } from '../../../types';
import {
  CalendarIcon,
  AlertCircleIcon,
  BriefcaseIcon,
  DollarSignIcon,
} from '../../../constants';
import { formatCurrency } from '../utils';
import { DashboardSummary, DashboardModalType } from '../types';

interface DashboardAlertBarProps {
  summary: DashboardSummary;
  onNavigate: (view: ViewType) => void;
  onOpenModal: (modal: DashboardModalType) => void;
}

export const DashboardAlertBar: React.FC<DashboardAlertBarProps> = ({
  summary,
  onNavigate,
  onOpenModal,
}) => {
  return (
    <div className="bg-white p-4 md:p-5 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)]">
      <div className="dashboard-action-grid grid min-w-0 grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Jadwal Bulan Ini */}
        <button
          type="button"
          onClick={() => onNavigate(ViewType.CALENDAR)}
          className="dashboard-action-card min-w-0 flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9] hover:bg-brand-accent/5 border border-[#EAEFF4] hover:border-brand-accent/30 transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl solid-orange text-white group-hover:scale-105 transition-transform flex-shrink-0">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-[#5A6A85] tracking-wider">
              Jadwal Bulan Ini
            </p>
            <p className="text-sm font-extrabold text-[#2A3547]">
              {summary.eventsThisMonth} Acara
            </p>
          </div>
        </button>

        {/* Invoice Belum Lunas */}
        <button
          type="button"
          onClick={() => onNavigate(ViewType.CLIENTS)}
          className="dashboard-action-card min-w-0 flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9] hover:bg-red-600/5 border border-[#EAEFF4] hover:border-red-600/30 transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl bg-red-600 text-white group-hover:scale-105 transition-transform flex-shrink-0">
            <AlertCircleIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-[#5A6A85] tracking-wider">
              Invoice Belum Lunas
            </p>
            <p className="text-sm font-extrabold text-red-600">
              {summary.unpaidInvoices} Invoice
            </p>
          </div>
        </button>

        {/* Tim & Vendor */}
        <button
          type="button"
          onClick={() => onOpenModal('teamMembers')}
          className="dashboard-action-card min-w-0 flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9] hover:bg-brand-accent/5 border border-[#EAEFF4] hover:border-brand-accent/30 transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl grad-brand text-white group-hover:scale-105 transition-transform flex-shrink-0">
            <BriefcaseIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-[#5A6A85] tracking-wider">
              Tim & Vendor
            </p>
            <p className="text-sm font-extrabold text-[#2A3547]">
              {summary.totalTeamMembers} Orang
            </p>
          </div>
        </button>

        {/* Sisa Honor Tim */}
        <button
          type="button"
          onClick={() => onOpenModal('payments')}
          className="dashboard-action-card min-w-0 flex items-center gap-3 p-3 rounded-xl bg-[#F4F6F9] hover:bg-cyan-600/5 border border-[#EAEFF4] hover:border-cyan-600/30 transition-all text-left group cursor-pointer"
        >
          <div className="p-2.5 rounded-xl solid-cyan text-white group-hover:scale-105 transition-transform flex-shrink-0">
            <DollarSignIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] uppercase font-bold text-[#5A6A85] tracking-wider">
              Sisa Honor Tim
            </p>
            <p className="text-sm font-extrabold text-brand-accent">
              {formatCurrency(summary.totalUnpaidTeamHonor)}
            </p>
          </div>
        </button>
      </div>

      {/* Task Alert if any pending or overdue tasks exist */}
      {(summary.pendingTasksCount > 0 || summary.overdueTasksCount > 0) && (
        <div className="mt-3 pt-3 border-t border-[#EAEFF4] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                summary.overdueTasksCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            <span className="text-xs font-semibold text-[#2A3547]">
              {summary.overdueTasksCount > 0 ? (
                <>
                  <span className="text-red-600 font-bold">{summary.overdueTasksCount} task terlambat</span>{' '}
                  dari total {summary.pendingTasksCount} task aktif
                </>
              ) : (
                `${summary.pendingTasksCount} task aktif perlu diselesaikan`
              )}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOpenModal('tasks')}
            className="text-xs font-bold text-brand-accent hover:underline cursor-pointer"
          >
            Lihat Rincian Task &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
