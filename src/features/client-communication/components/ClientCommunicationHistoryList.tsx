import React from 'react';
import { ClientInteractionLog } from '../types';
import {
  MessageSquare,
  Clock,
  Trash2,
  CheckCircle2,
  Calendar,
  CreditCard,
  FileText,
} from 'lucide-react';
import { WhatsappIcon } from '../../../constants';

export interface ClientCommunicationHistoryListProps {
  logs: ClientInteractionLog[];
  clientName: string;
  onDeleteLog?: (logId: string) => void;
  onClearAll?: () => void;
  isLoading?: boolean;
}

export const ClientCommunicationHistoryList: React.FC<ClientCommunicationHistoryListProps> = ({
  logs,
  clientName,
  onDeleteLog,
  onClearAll,
  isLoading = false,
}) => {
  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getLogTypeBadge = (type: ClientInteractionLog['type']) => {
    switch (type) {
      case 'payment_reminder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20">
            <CreditCard className="w-3 h-3" /> Pengingat Pembayaran
          </span>
        );
      case 'event_reminder':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-700 border border-purple-500/20">
            <Calendar className="w-3 h-3" /> Pengingat Acara
          </span>
        );
      case 'catalog_share':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
            <FileText className="w-3 h-3" /> Brosur / Katalog
          </span>
        );
      case 'portal_share':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-700 border border-indigo-500/20">
            <CheckCircle2 className="w-3 h-3" /> Portal Pengantin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
            <WhatsappIcon className="w-3 h-3" /> Chat WhatsApp
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-xs text-brand-text-secondary animate-pulse">
        Memuat riwayat komunikasi...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-8 text-center bg-brand-surface rounded-2xl border border-brand-border">
        <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-brand-text-primary">Belum Ada Riwayat Komunikasi</p>
        <p className="text-xs text-brand-text-secondary mt-1 max-w-sm mx-auto">
          Setiap pesan atau pengingat yang Anda kirim via WhatsApp ke {clientName} akan otomatis tercatat rapi di sini.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-brand-border">
        <span className="text-xs font-bold text-brand-text-secondary uppercase tracking-wider">
          Total {logs.length} Interaksi Tercatat
        </span>
        {onClearAll && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-[11px] font-medium text-rose-500 hover:text-rose-600 transition-colors"
          >
            Hapus Semua Riwayat
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {logs.map(log => (
          <div
            key={log.id}
            className="p-3.5 rounded-xl bg-white border border-brand-border shadow-2xs hover:border-brand-accent/30 transition-all text-xs"
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {getLogTypeBadge(log.type)}
                {log.recipientPhone && (
                  <span className="text-[11px] text-brand-text-secondary">
                    ke {log.recipientPhone}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 inline-flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatTimestamp(log.timestamp)}
                </span>
                {onDeleteLog && (
                  <button
                    type="button"
                    onClick={() => onDeleteLog(log.id)}
                    className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                    title="Hapus riwayat ini"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 font-mono text-[11px] whitespace-pre-wrap leading-relaxed max-h-32 overflow-y-auto">
              {log.message}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
