import React from 'react';
import { UsersIcon, AlertCircleIcon, TrendingUpIcon } from '../../../constants';
import { ClientViewSection } from '../types';

interface ClientsToolbarProps {
  activeViewSection: ClientViewSection;
  setActiveViewSection: (section: ClientViewSection) => void;
  totalClients: number;
  duesCount: number;
  totalProjects: number;
}

export const ClientsToolbar: React.FC<ClientsToolbarProps> = ({
  activeViewSection,
  setActiveViewSection,
  totalClients,
  duesCount,
  totalProjects,
}) => {
  return (
    <div className="flex flex-nowrap items-center gap-1 overflow-x-auto border-b border-[#EAEFF4] pb-2 sm:flex-wrap sm:gap-2 sm:overflow-visible sm:pb-3">
      <button
        type="button"
        onClick={() => setActiveViewSection('clients')}
        className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          activeViewSection === 'clients'
            ? 'bg-[#5D87FF] text-white shadow-xs shadow-[#5D87FF]/25'
            : 'bg-white text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F4F6F9] border border-[#EAEFF4]'
        }`}
      >
        <UsersIcon className="w-4 h-4" />
        <span className="sm:hidden">Pengantin</span>
        <span className="hidden sm:inline">Daftar Pengantin</span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            activeViewSection === 'clients' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#5A6A85]'
          }`}
        >
          {totalClients}
        </span>
      </button>

      <button
        type="button"
        onClick={() => setActiveViewSection('dues')}
        className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          activeViewSection === 'dues'
            ? 'bg-[#FA896B] text-white shadow-xs shadow-[#FA896B]/25'
            : 'bg-white text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F4F6F9] border border-[#EAEFF4]'
        }`}
      >
        <AlertCircleIcon className="w-4 h-4" />
        <span className="sm:hidden">Pembayaran</span>
        <span className="hidden sm:inline">Pembayaran Belum Lunas</span>
        {duesCount > 0 && (
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
              activeViewSection === 'dues' ? 'bg-white/25 text-white' : 'bg-[#FDEDE8] text-[#FA896B]'
            }`}
          >
            {duesCount}
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => setActiveViewSection('analytics')}
        className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          activeViewSection === 'analytics'
            ? 'bg-[#5D87FF] text-white shadow-xs shadow-[#5D87FF]/25'
            : 'bg-white text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F4F6F9] border border-[#EAEFF4]'
        }`}
      >
        <TrendingUpIcon className="w-4 h-4" />
        <span className="sm:hidden">Analitik</span>
        <span className="hidden sm:inline">Grafik &amp; Analitik</span>
      </button>

      <button
        type="button"
        onClick={() => setActiveViewSection('finance-recap')}
        className={`flex flex-shrink-0 items-center gap-2 whitespace-nowrap px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
          activeViewSection === 'finance-recap'
            ? 'bg-[#5D87FF] text-white shadow-xs shadow-[#5D87FF]/25'
            : 'bg-white text-[#5A6A85] hover:text-[#2A3547] hover:bg-[#F4F6F9] border border-[#EAEFF4]'
        }`}
      >
        <span className="sm:hidden">Rekap</span>
        <span className="hidden sm:inline">Rekap Keuangan per Pengantin</span>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
            activeViewSection === 'finance-recap' ? 'bg-white/20 text-white' : 'bg-[#F4F6F9] text-[#5A6A85]'
          }`}
        >
          {totalProjects}
        </span>
      </button>
    </div>
  );
};

export default ClientsToolbar;
