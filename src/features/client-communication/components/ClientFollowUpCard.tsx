import React from 'react';
import { ClientReminder } from '../types';
import { WhatsAppChatButton } from './WhatsAppChatButton';
import {
  Clock,
  AlertTriangle,
  Calendar,
  CreditCard,
  UserCheck,
  CheckCircle,
} from 'lucide-react';
import { formatCurrency } from '../../../utils/currency';

export interface ClientFollowUpCardProps {
  reminder: ClientReminder;
  onSendWhatsApp?: (reminder: ClientReminder) => void;
  onDismiss?: (reminderId: string) => void;
}

export const ClientFollowUpCard: React.FC<ClientFollowUpCardProps> = ({
  reminder,
  onSendWhatsApp,
  onDismiss,
}) => {
  const isOverdue = reminder.isOverdue;
  const days = reminder.daysRemaining;

  const getTypeIcon = () => {
    switch (reminder.type) {
      case 'payment_due':
        return <CreditCard className="w-4 h-4 text-amber-500" />;
      case 'wedding_upcoming':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'lead_followup':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (reminder.type) {
      case 'payment_due':
        return 'Pelunasan Pembayaran';
      case 'wedding_upcoming':
        return 'Jadwal Acara Mendekat';
      case 'lead_followup':
        return 'Follow-Up Calon Pengantin';
    }
  };

  const getUrgencyBadge = () => {
    if (isOverdue) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 border border-rose-500/20">
          <AlertTriangle className="w-3 h-3" /> Lewat {Math.abs(days)} Hari
        </span>
      );
    }
    if (days === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 border border-amber-500/20">
          <Clock className="w-3 h-3" /> Hari Ini
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
        <Clock className="w-3 h-3" /> {days} Hari Lagi
      </span>
    );
  };

  const isSent = Boolean(reminder.sentAt);

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isOverdue
          ? 'bg-rose-50/40 border-rose-200'
          : isSent
          ? 'bg-slate-50 border-slate-200 opacity-75'
          : 'bg-white border-brand-border shadow-xs hover:border-brand-accent/30'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white shadow-xs border border-brand-border flex items-center justify-center">
            {getTypeIcon()}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary">
              {getTypeLabel()}
            </span>
            <h4 className="text-sm font-bold text-brand-text-primary leading-tight">
              {reminder.clientName}
            </h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {getUrgencyBadge()}
          {isSent && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" /> Terkirim
            </span>
          )}
        </div>
      </div>

      {reminder.projectName && (
        <p className="text-xs text-brand-text-secondary mb-2">
          Acara: <span className="font-semibold text-brand-text-primary">{reminder.projectName}</span>
        </p>
      )}

      {reminder.amountDue !== undefined && reminder.amountDue > 0 && (
        <div className="mb-2 p-2 rounded-xl bg-white/80 border border-brand-border flex items-center justify-between text-xs">
          <span className="text-brand-text-secondary">Sisa Tagihan:</span>
          <span className="font-black text-rose-600">{formatCurrency(reminder.amountDue)}</span>
        </div>
      )}

      <p className="text-xs text-slate-600 bg-white/60 p-2.5 rounded-xl border border-brand-border/60 mb-3 line-clamp-2">
        "{reminder.suggestedMessage}"
      </p>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-brand-border/60">
        <span className="text-[11px] text-brand-text-secondary">
          {reminder.targetPhone ? `WA: ${reminder.targetPhone}` : 'No HP belum ada'}
        </span>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <button
              type="button"
              onClick={() => onDismiss(reminder.id)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-2 py-1"
            >
              Abaikan
            </button>
          )}
          <WhatsAppChatButton
            phone={reminder.targetPhone}
            message={reminder.suggestedMessage}
            size="sm"
            label={isSent ? 'Kirim Ulang WA' : 'Kirim WA'}
            onClick={() => onSendWhatsApp?.(reminder)}
          />
        </div>
      </div>
    </div>
  );
};
