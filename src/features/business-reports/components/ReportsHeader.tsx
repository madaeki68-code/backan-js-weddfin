import React from 'react';
import PageHeader from '../../../layouts/PageHeader';
import { DownloadIcon, Share2Icon, PlusIcon } from '../../../constants';
import { FileText } from 'lucide-react';

interface ReportsHeaderProps {
  isExportingPdf: boolean;
  onDownloadPdf: () => void;
  onExportCsv: () => void;
  onOpenFeedbackModal: () => void;
  onOpenShareModal: () => void;
}

export const ReportsHeader: React.FC<ReportsHeaderProps> = ({
  isExportingPdf,
  onDownloadPdf,
  onExportCsv,
  onOpenFeedbackModal,
  onOpenShareModal,
}) => {
  return (
    <PageHeader
      title="KPI & Testimoni Pengantin"
      subtitle="Analisis bisnis, performa paket & kru, efektivitas promosi, dan kepuasan pengantin"
    >
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onExportCsv}
          className="btn-modern-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
          title="Export CSV"
        >
          <DownloadIcon className="w-4 h-4 text-brand-text-secondary" />
          <span className="hidden sm:inline">Export</span> CSV
        </button>

        <button
          onClick={onDownloadPdf}
          disabled={isExportingPdf}
          className="btn-modern-secondary text-xs px-3 py-2 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          title="Unduh laporan lengkap berformat PDF untuk periode yang dipilih"
        >
          <FileText className="w-4 h-4 text-brand-accent" />
          <span>{isExportingPdf ? 'Menyusun PDF...' : 'Unduh Laporan PDF'}</span>
        </button>

        <button
          onClick={onOpenShareModal}
          className="btn-modern-secondary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
          title="Bagikan Tautan Formulir Ulasan"
        >
          <Share2Icon className="w-4 h-4 text-sky-400" />
          <span className="hidden sm:inline">Bagikan</span> Form Ulasan
        </button>

        <button
          onClick={onOpenFeedbackModal}
          className="btn-modern-primary text-xs px-3 py-2 flex items-center gap-1.5 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tulis Ulasan</span>
        </button>
      </div>
    </PageHeader>
  );
};

export default ReportsHeader;
