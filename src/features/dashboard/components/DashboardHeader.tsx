import React from 'react';
import { ViewType } from '../../../types';
import { FolderKanbanIcon, DollarSignIcon } from '../../../constants';

interface DashboardHeaderProps {
  title: string;
  subtitle: string;
  onNavigate: (view: ViewType) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onNavigate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-white p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)]">
      <div>
        <h1 className="text-base sm:text-2xl font-extrabold text-[#2A3547] tracking-tight">
          {title}
        </h1>
        <p className="text-[11px] sm:text-sm text-[#5A6A85] mt-0.5 sm:mt-1">
          {subtitle}
        </p>
      </div>
      <div className="flex w-full flex-col items-stretch gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-2.5">
        <button
          type="button"
          onClick={() => onNavigate(ViewType.CLIENTS)}
          className="min-w-0 flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl grad-brand text-white hover:opacity-90 shadow-xs transition-opacity cursor-pointer"
        >
          <FolderKanbanIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>+ Acara Pernikahan</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate(ViewType.FINANCE)}
          className="min-w-0 flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm font-semibold py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 transition-colors cursor-pointer"
        >
          <DollarSignIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span>+ Catat Transaksi</span>
        </button>
      </div>
    </div>
  );
};
