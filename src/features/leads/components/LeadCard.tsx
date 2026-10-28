import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
import { statusConfig } from '../constants/leads.constants';
import { getDaysSince, getInitials, getContactChannelIcon } from '../utils/leadFormatters';

export interface LeadCardProps {
  lead: Lead;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, leadId: string) => void;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onNextStatus?: () => void;
  onMoveStatus?: (newStatus: LeadStatus) => void;
  onShare?: (type: 'package' | 'booking') => void;
  onViewDetail?: () => void;
}

export const LeadCard: React.FC<LeadCardProps> = ({
  lead,
  onDragStart,
  onClick,
  onEdit,
  onDelete,
  onNextStatus,
  onMoveStatus,
  onShare,
  onViewDetail,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formattedInputDate = useMemo(() => {
    try {
      if (!lead.date) return 'Baru';
      return new Date(lead.date).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return lead.date || 'Baru';
    }
  }, [lead.date]);

  const daysSince = useMemo(() => {
    try {
      return getDaysSince(lead.date);
    } catch {
      return '';
    }
  }, [lead.date]);

  const handleClickCard = () => {
    if (onClick) {
      onClick();
    } else if (onViewDetail) {
      onViewDetail();
    }
  };

  const renderActions = () => {
    if (lead.status === LeadStatus.DISCUSSION) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare('package');
              }}
              className="btn-box-wa text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
              title="Bagikan Package via WA"
            >
              <WhatsappIcon className="w-3.5 h-3.5 flex-shrink-0 text-white" />
              <span>Package WA</span>
            </button>
          )}
          {onMoveStatus && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onNextStatus) {
                  onNextStatus();
                } else {
                  onMoveStatus(LeadStatus.FOLLOW_UP);
                }
              }}
              className="btn-box-read text-xs px-3 py-1.5 inline-flex items-center gap-1 font-semibold cursor-pointer"
              title="Pindah ke Follow Up"
            >
              <span>Follow Up</span>
              <ChevronRightIcon className="w-3.5 h-3.5 flex-shrink-0 text-white" />
            </button>
          )}
        </div>
      );
    }
    if (lead.status === LeadStatus.FOLLOW_UP) {
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          {onShare && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onShare('booking');
              }}
              className="btn-box-wa text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5 cursor-pointer"
              title="Kirim Form Booking via WA"
            >
              <WhatsappIcon className="w-3.5 h-3.5 flex-shrink-0 text-white" />
              <span>Form WA</span>
            </button>
          )}
          {onMoveStatus && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onNextStatus) {
                  onNextStatus();
                } else {
                  onMoveStatus(LeadStatus.CONVERTED);
                }
              }}
              className="btn-box-add text-xs px-3 py-1.5 inline-flex items-center gap-1 font-semibold cursor-pointer"
              title="Konversi ke Pengantin"
            >
              <span>Konversi</span>
              <CheckCircleIcon className="w-3.5 h-3.5 flex-shrink-0 text-white" />
            </button>
          )}
        </div>
      );
    }
    return null;
  };

  const statusItem = statusConfig[lead.status] || {
    color: '#3563E9',
    border: '#D9E5FF',
    badgeClass: 'bg-[#ECF2FF] text-[#2348C7]',
    title: lead.status,
  };

  return (
    <div
      draggable={Boolean(onDragStart)}
      onDragStart={(e) => onDragStart?.(e, lead.id)}
      onClick={handleClickCard}
      className="group rounded-xl border border-brand-border bg-white shadow-sm transition-all hover:shadow-md leads-card select-none overflow-hidden cursor-pointer"
    >
      {/* --- COMPACT ROW --- */}
      <div className="p-2 sm:p-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Avatar Inisial */}
          <div
            className="flex h-8 w-8 sm:h-8.5 sm:w-8.5 items-center justify-center rounded-lg text-[11px] font-bold shrink-0 shadow-2xs border text-white"
            style={{ backgroundColor: statusItem.color, borderColor: statusItem.border }}
          >
            {getInitials(lead.name)}
          </div>

          {/* Nama dan Waktu Input */}
          <div className="min-w-0 flex-1">
            <p className="font-bold text-xs sm:text-[13px] text-[#2A3547] truncate leading-snug">
              {lead.name}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-[#5A6A85] mt-0.5 min-w-0">
              <CalendarIcon className="w-3 h-3 text-[#5D87FF] shrink-0" />
              <span className="truncate">
                {formattedInputDate} {daysSince ? `(${daysSince})` : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Tombol Detail */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all shrink-0 cursor-pointer ${
            isExpanded
              ? 'bg-[#3563E9] text-white shadow-xs'
              : 'bg-[#EEF2F6] text-[#3563E9] hover:bg-[#3563E9] hover:text-white'
          }`}
          title={isExpanded ? 'Tutup Detail' : 'Lihat Detail'}
        >
          <span>{isExpanded ? 'Tutup' : 'Detail'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* --- DETAIL CARD (Expanded) --- */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-3 border-t border-brand-border space-y-3 animate-fadeIn bg-slate-50/50">
          <div className="flex items-center justify-between pt-0.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${statusItem.badgeClass}`}
            >
              {statusItem.title}
            </span>

            <div className="flex items-center gap-1.5">
              {onEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md border border-[#D8E1F0] bg-white text-xs font-medium text-[#42526B] shadow-2xs hover:border-[#BFD1F9] hover:text-[#2348C7] transition-colors cursor-pointer"
                  title="Edit Detail"
                >
                  <PencilIcon className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="inline-flex items-center justify-center h-6.5 w-6.5 rounded-md bg-[#EA5A47] text-white shadow-2xs hover:bg-[#D94F3C] transition-colors cursor-pointer"
                  title="Hapus Calon Pengantin"
                >
                  <Trash2Icon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* PEMINDAHAN ANTAR CARD / STATUS */}
          {onMoveStatus && (
            <div className="p-2 rounded-xl bg-white border border-[#EAEFF4] space-y-1.5 shadow-2xs">
              <div className="flex items-center justify-between text-[10px] font-bold text-[#5A6A85] uppercase tracking-wider">
                <span>Pindahkan Status:</span>
                <span className="text-[#3563E9] font-semibold lowercase">klik untuk pindah</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {Object.values(LeadStatus).map((st) => {
                  const conf = statusConfig[st];
                  const isCurrent = lead.status === st;
                  return (
                    <button
                      key={st}
                      type="button"
                      disabled={isCurrent}
                      onClick={(e) => {
                        e.stopPropagation();
                        onMoveStatus(st);
                      }}
                      className={`px-2 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        isCurrent
                          ? 'ring-2 ring-offset-1 opacity-90 cursor-default'
                          : 'cursor-pointer hover:shadow-xs active:scale-95'
                      }`}
                      style={{
                        backgroundColor: isCurrent ? conf.color : conf.softBg,
                        color: isCurrent ? '#ffffff' : conf.color,
                        borderColor: conf.border,
                        borderWidth: 1,
                      }}
                      title={
                        isCurrent
                          ? `Status saat ini: ${conf.title}`
                          : `Pindahkan ke ${conf.title}`
                      }
                    >
                      {isCurrent ? (
                        <CheckCircleIcon className="w-3.5 h-3.5 text-white shrink-0" />
                      ) : null}
                      <span>{conf.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Informasi Lengkap Calon Pengantin */}
          <div className="space-y-3 text-xs text-[#42526B] bg-white rounded-xl p-3 border border-[#EAEFF4] shadow-sm">
            <h5 className="font-bold text-[#111827] border-b border-slate-100 pb-1.5 mb-2">
              Informasi Pengantin
            </h5>
            {lead.location && (
              <div className="flex items-start gap-2">
                <MapPinIcon className="w-3.5 h-3.5 text-[#6B7280] shrink-0 mt-0.5" />
                <span className="font-medium text-[#2A3547]">{lead.location}</span>
              </div>
            )}

            {lead.eventDate && (
              <div className="flex items-start gap-2">
                <CalendarIcon className="w-3.5 h-3.5 text-[#5D87FF] shrink-0 mt-0.5" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-[#6B7280] uppercase">
                    Tanggal Acara
                  </span>
                  <span className="font-semibold text-[#2A3547]">
                    {new Date(lead.eventDate).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            )}

            {lead.whatsapp && (
              <div className="flex items-center justify-between gap-1.5 pt-0.5">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-green-600 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </span>
                  <span className="truncate">{lead.whatsapp}</span>
                </div>
                <a
                  href={`https://wa.me/${cleanPhoneNumber(lead.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="btn-box-wa px-2 py-0.5 text-[10px] rounded-md font-semibold inline-flex items-center gap-1 shrink-0"
                  title="Chat Langsung via WA"
                >
                  <span>Chat</span>
                </a>
              </div>
            )}

            {lead.address && (
              <div className="pt-1.5 border-t border-slate-100 text-[11px] text-[#5A6A85]">
                <span className="font-semibold text-[#2A3547]">Alamat: </span>
                <span>{lead.address}</span>
              </div>
            )}

            {lead.notes && (
              <div className="pt-1.5 border-t border-slate-100 text-[11px] leading-relaxed text-[#41506B] italic">
                "{lead.notes}"
              </div>
            )}

            <div className="flex items-center gap-1.5 pt-1 text-[10px] text-[#5A6A85] border-t border-slate-100">
              {getContactChannelIcon(lead.contactChannel)}
              <span>Sumber: {lead.contactChannel}</span>
            </div>
          </div>

          {/* Tombol Aksi Status */}
          {renderActions() && (
            <div className="pt-1 border-t border-[#EEF2F7] flex justify-end">
              {renderActions()}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
