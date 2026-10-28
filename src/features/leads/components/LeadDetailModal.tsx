import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { Lead, LeadStatus } from '../../../types';
import { LeadStatusBadge } from './LeadStatusBadge';
import { getContactChannelIcon, getDaysSince } from '../utils/leadFormatters';
import { CalendarIcon, MapPinIcon, PhoneIncomingIcon, Share2Icon } from 'lucide-react';
import { WhatsappIcon } from '../../../constants';

export interface LeadDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
  onEdit: (lead: Lead) => void;
  onConvert: (lead: Lead) => void;
  onSharePackage: (lead: Lead) => void;
  onShareBooking: (lead: Lead) => void;
}

export const LeadDetailModal: React.FC<LeadDetailModalProps> = ({
  isOpen,
  onClose,
  lead,
  onEdit,
  onConvert,
  onSharePackage,
  onShareBooking,
}) => {
  if (!lead) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detail Calon Pengantin: ${lead.name}`} size="2xl">
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-brand-bg p-4 rounded-xl border border-brand-border">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-[#3563E9] flex items-center justify-center font-bold text-lg">
              {lead.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-text-light">{lead.name}</h3>
              <p className="text-xs text-brand-text-secondary flex items-center gap-2 mt-0.5">
                <span>Masuk {getDaysSince(lead.createdAt || lead.date)}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {getContactChannelIcon(lead.contactChannel)} {lead.contactChannel}
                </span>
              </p>
            </div>
          </div>
          <div>
            <LeadStatusBadge status={lead.status} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="p-4 bg-white rounded-xl border border-brand-border space-y-3">
            <h4 className="font-semibold text-brand-text-light border-b border-brand-border pb-2">Informasi Kontak &amp; Event</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><PhoneIncomingIcon className="w-3.5 h-3.5" /> WhatsApp:</span>
                <span className="font-medium text-brand-text-primary">{lead.whatsapp || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><MapPinIcon className="w-3.5 h-3.5" /> Lokasi:</span>
                <span className="font-medium text-brand-text-primary">{lead.location || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-text-secondary flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5" /> Tanggal Acara:</span>
                <span className="font-medium text-brand-text-primary">
                  {lead.eventDate
                    ? new Date(lead.eventDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl border border-brand-border space-y-3">
            <h4 className="font-semibold text-brand-text-light border-b border-brand-border pb-2">Alamat &amp; Catatan</h4>
            <div className="space-y-2 text-xs">
              {lead.address && (
                <div className="space-y-1">
                  <span className="text-brand-text-secondary block font-medium">Alamat:</span>
                  <p className="text-brand-text-primary bg-brand-bg p-2 rounded-lg border border-brand-border">
                    {lead.address}
                  </p>
                </div>
              )}
              <div className="space-y-1 pt-1">
                <span className="text-brand-text-secondary block font-medium">Catatan Interaksi:</span>
                <p className="text-brand-text-primary bg-brand-bg p-2.5 rounded-lg border border-brand-border min-h-[60px] whitespace-pre-wrap">
                  {lead.notes || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-brand-border">
          <button
            type="button"
            onClick={() => { onClose(); onSharePackage(lead); }}
            className="button-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Share2Icon className="w-3.5 h-3.5" /> Bagikan Paket
          </button>
          <button
            type="button"
            onClick={() => { onClose(); onShareBooking(lead); }}
            className="button-secondary text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <WhatsappIcon className="w-3.5 h-3.5 text-emerald-600" /> Kirim Form Booking
          </button>
          <button
            type="button"
            onClick={() => { onClose(); onEdit(lead); }}
            className="button-secondary text-xs cursor-pointer"
          >
            Edit Calon Pengantin
          </button>
          {lead.status !== LeadStatus.CONVERTED && lead.status !== LeadStatus.REJECTED && (
            <button
              type="button"
              onClick={() => { onClose(); onConvert(lead); }}
              className="button-primary text-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Konversi ke Pengantin
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
