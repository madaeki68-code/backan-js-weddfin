import React from 'react';
import { Lead, LeadStatus, ViewType } from '../../../types';

interface LatestLeadsWidgetProps {
  leads: Lead[];
  onNavigate: (view: ViewType) => void;
}

const statusColors: Record<LeadStatus, string> = {
  [LeadStatus.DISCUSSION]: 'bg-blue-100 text-blue-800',
  [LeadStatus.FOLLOW_UP]: 'bg-amber-100 text-amber-800',
  [LeadStatus.CONVERTED]: 'bg-emerald-100 text-emerald-800',
  [LeadStatus.REJECTED]: 'bg-rose-100 text-rose-800',
};

export const LatestLeadsWidget: React.FC<LatestLeadsWidgetProps> = ({
  leads,
  onNavigate,
}) => {
  return (
    <div className="bg-white p-5 md:p-6 rounded-2xl border border-[#EAEFF4] shadow-[0_9px_17.5px_rgba(0,0,0,0.05)] h-full">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-bold text-lg text-[#2A3547]">Prospek Terbaru</h3>
        <button
          type="button"
          onClick={() => onNavigate(ViewType['Calon Pengantin'])}
          className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-brand-accent hover:bg-brand-accent/10 cursor-pointer"
        >
          Semua &rarr;
        </button>
      </div>
      <div className="space-y-3">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-[#EAEFF4] bg-[#F8FAFC] p-3"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-[#2A3547]">{lead.name}</p>
              <p className="mt-0.5 text-xs text-[#5A6A85]">
                {new Date(lead.date).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}{' '}
                · {lead.contactChannel}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                statusColors[lead.status] || 'bg-slate-100 text-slate-700'
              }`}
            >
              {lead.status}
            </span>
          </div>
        ))}
        {leads.length === 0 && (
          <p className="py-8 text-center text-sm text-[#5A6A85]">Belum ada prospek.</p>
        )}
      </div>
    </div>
  );
};
