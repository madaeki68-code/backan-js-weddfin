import React from 'react';
import { Lead, LeadStatus } from '../../../types';
import {
  CalendarIcon,
  MapPinIcon,
  PencilIcon,
  Trash2Icon,
  ChevronRightIcon,
  CheckCircleIcon,
  WhatsappIcon,
  cleanPhoneNumber,
} from '../../../constants';
import { statusConfig, sourceColors } from '../constants/leads.constants';
import { getContactChannelIcon, getInitials } from '../utils/leadFormatters';

export interface LeadRowProps {
  lead: Lead;
  index: number;
  currentPage: number;
  itemsPerPage: number;
  onViewDetail?: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  onDelete: (leadId: string) => void;
  onNextStatus: (leadId: string, currentStatus: LeadStatus) => void;
  onOpenConvertModal: (lead: Lead) => void;
  onOpenShareModal: (type: 'package' | 'booking', lead: Lead) => void;
}

export const LeadRow: React.FC<LeadRowProps> = ({
  lead,
  index,
  currentPage,
  itemsPerPage,
  onViewDetail,
  onEdit,
  onDelete,
  onNextStatus,
  onOpenConvertModal,
  onOpenShareModal,
}) => {
  const sc = statusConfig[lead.status] ?? { color: '#64748b', title: lead.status };
  const isHot = new Date(lead.date) > new Date(Date.now() - 24 * 60 * 60 * 1000);

  const handleRowClick = () => {
    if (onViewDetail) {
      onViewDetail(lead);
    } else {
      onEdit(lead);
    }
  };

  return (
    <tr
      className="border-t border-brand-border/50 hover:bg-brand-bg/60 transition-colors cursor-pointer group"
      onClick={handleRowClick}
    >
      {/* # */}
      <td className="px-4 py-3 text-brand-text-secondary text-xs !border-0">
        {(currentPage - 1) * itemsPerPage + index + 1}
      </td>

      {/* Nama */}
      <td className="px-4 py-3 !border-0">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ backgroundColor: sc.color }}
          >
            {getInitials(lead.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-brand-text-light text-sm truncate max-w-[160px] flex items-center gap-1.5">
              <span className="truncate">{lead.name}</span>
              {isHot && (
                <span
                  className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-orange-100 text-orange-700 shrink-0"
                  title="Baru 24 jam"
                >
                  Baru
                </span>
              )}
            </p>
            {lead.notes && (
              <p className="text-xs text-brand-text-secondary truncate max-w-[160px]">
                {lead.notes}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* WA */}
      <td className="px-4 py-3 hidden sm:table-cell !border-0">
        {lead.whatsapp ? (
          <a
            href={`https://wa.me/${cleanPhoneNumber(lead.whatsapp)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="btn-box-wa px-2 py-1 text-xs inline-flex items-center gap-1"
          >
            <WhatsappIcon className="w-3 h-3" />
            {lead.whatsapp}
          </a>
        ) : (
          <span className="text-brand-text-secondary text-xs">—</span>
        )}
      </td>

      {/* Lokasi */}
      <td className="px-4 py-3 hidden md:table-cell !border-0">
        {lead.location ? (
          <span className="flex items-center gap-1 text-xs text-brand-text-primary">
            <MapPinIcon className="w-3 h-3 text-brand-accent flex-shrink-0" />
            {lead.location}
          </span>
        ) : (
          <span className="text-brand-text-secondary text-xs">—</span>
        )}
      </td>

      {/* Sumber */}
      <td className="px-4 py-3 hidden lg:table-cell !border-0">
        <span className="flex items-center gap-1.5 text-xs text-brand-text-primary">
          <span style={{ color: sourceColors[lead.contactChannel] }}>
            {getContactChannelIcon(lead.contactChannel)}
          </span>
          {lead.contactChannel}
        </span>
      </td>

      {/* Tgl Kontak */}
      <td className="px-4 py-3 hidden lg:table-cell !border-0">
        <span className="text-xs text-brand-text-primary">
          {new Date(lead.date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      </td>

      {/* Tgl Acara */}
      <td className="px-4 py-3 hidden xl:table-cell !border-0">
        {lead.eventDate ? (
          <span className="flex items-center gap-1 text-xs text-brand-text-primary">
            <CalendarIcon className="w-3 h-3 text-brand-accent flex-shrink-0" />
            {new Date(lead.eventDate).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        ) : (
          <span className="text-brand-text-secondary text-xs">—</span>
        )}
      </td>

      {/* Status */}
      <td className="px-4 py-3 !border-0">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold text-white whitespace-nowrap"
          style={{ backgroundColor: sc.color }}
        >
          {sc.title}
        </span>
      </td>

      {/* Aksi */}
      <td className="px-4 py-3 !border-0" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {lead.status === LeadStatus.DISCUSSION && (
            <>
              <button
                type="button"
                onClick={() => onOpenShareModal('package', lead)}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#1EBF5A]"
                title="Kirim Package WA"
              >
                <WhatsappIcon className="w-3 h-3" />
                <span>Pkg</span>
              </button>
              <button
                type="button"
                onClick={() => onNextStatus(lead.id, lead.status)}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-[#5D87FF] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#4570EA]"
                title="Pindah ke Follow Up"
              >
                <span>FU</span>
                <ChevronRightIcon className="w-3 h-3" />
              </button>
            </>
          )}
          {lead.status === LeadStatus.FOLLOW_UP && (
            <>
              <button
                type="button"
                onClick={() => onOpenShareModal('booking', lead)}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#1EBF5A]"
                title="Kirim Form Booking WA"
              >
                <WhatsappIcon className="w-3 h-3" />
                <span>Booking</span>
              </button>
              <button
                type="button"
                onClick={() => onOpenConvertModal(lead)}
                className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-[#14A76C] px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-[#118E5C]"
                title="Konversi"
              >
                <CheckCircleIcon className="w-3 h-3" />
                <span>Konversi</span>
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => onEdit(lead)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-[#D8E1F0] bg-white text-[#42526B] shadow-sm transition hover:border-[#BFD1F9] hover:text-[#2348C7]"
            title="Edit"
          >
            <PencilIcon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[#EA5A47] text-white shadow-sm transition hover:bg-[#D94F3C]"
            title="Hapus"
          >
            <Trash2Icon className="w-3.5 h-3.5 text-white" />
          </button>
        </div>
      </td>
    </tr>
  );
};
