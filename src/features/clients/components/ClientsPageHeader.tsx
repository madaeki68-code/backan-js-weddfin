import React from 'react';
import { PlusIcon, DownloadIcon } from '../../../constants';

interface ClientsPageHeaderProps {
  onOpenAddModal: () => void;
  onOpenPdfPreview: () => void;
}

export const ClientsPageHeader: React.FC<ClientsPageHeaderProps> = ({
  onOpenAddModal,
  onOpenPdfPreview,
}) => {
  return (
    <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold text-[#2A3547] tracking-tight">Data Pengantin</h2>
        <p className="text-xs text-[#5A6A85] mt-0.5">
          Kelola seluruh data calon pengantin, pembayaran, dan acara pernikahan
        </p>
      </div>
      <div className="flex flex-wrap sm:flex-row items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onOpenPdfPreview}
          className="w-auto max-w-full min-h-[44px] bg-white hover:bg-[#F4F6F9] text-[#2A3547] font-bold px-3 sm:px-4 py-2.5 rounded-xl border border-[#EAEFF4] inline-flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
        >
          <DownloadIcon className="w-5 h-5 flex-shrink-0" />
          <span>Unduh PDF</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddModal}
          className="w-auto max-w-full min-h-[44px] bg-[#5D87FF] hover:bg-[#4871e3] text-white font-bold px-3 sm:px-4 py-2.5 rounded-xl shadow-[0_4px_12px_rgba(93,135,255,0.25)] inline-flex items-center justify-center gap-2 text-xs sm:text-sm transition-all cursor-pointer"
        >
          <PlusIcon className="w-5 h-5 flex-shrink-0" />
          <span>Tambah Pengantin</span>
        </button>
      </div>
    </div>
  );
};

export default ClientsPageHeader;
