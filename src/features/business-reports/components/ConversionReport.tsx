import React from 'react';
import { LeadConversionStat } from '../types/businessReports.types';
import { TargetIcon } from '../../../constants';

interface ConversionReportProps {
  leadConversionStats: LeadConversionStat;
}

export const ConversionReport: React.FC<ConversionReportProps> = ({ leadConversionStats }) => {
  return (
    <div className="space-y-4">
      {/* ── Funnel Overview ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-brand-text-secondary block mb-1">
            Total Prospek (Leads)
          </span>
          <span className="text-xl font-black text-brand-text-primary">
            {leadConversionStats.total}
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-1">
            Berhasil Closing
          </span>
          <span className="text-xl font-black text-emerald-600">
            {leadConversionStats.converted}
          </span>
          <span className="text-[10px] text-brand-text-secondary block mt-0.5">
            Konversi: {leadConversionStats.rate}%
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-sky-600 block mb-1">
            Sedang Follow Up
          </span>
          <span className="text-xl font-black text-sky-600">
            {leadConversionStats.followUp + leadConversionStats.discussion}
          </span>
        </div>

        <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
          <span className="text-[10px] uppercase font-bold text-rose-500 block mb-1">
            Batal / Ditolak
          </span>
          <span className="text-xl font-black text-rose-500">
            {leadConversionStats.rejected}
          </span>
        </div>
      </div>

      {/* ── Channel Effectiveness Table ─────────────────────────────────── */}
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <h4 className="text-sm font-bold text-brand-text-primary mb-1 flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-brand-accent" />
          Efektivitas Channel Promosi & Sumber Calon Pengantin
        </h4>
        <p className="text-xs text-brand-text-secondary mb-4">
          Perbandingan konversi closing berdasarkan jalur masuk calon pengantin (Instagram, WhatsApp, TikTok, dll.).
        </p>

        <div className="overflow-x-auto rounded-xl border border-brand-border/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-2.5 px-3">Nama Channel Promosi</th>
                <th className="py-2.5 px-3 text-center">Total Calon Masuk</th>
                <th className="py-2.5 px-3 text-center">Closing (Booking)</th>
                <th className="py-2.5 px-3 text-right">Tingkat Konversi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {leadConversionStats.channels.map(channel => (
                <tr key={channel.channel} className="hover:bg-brand-bg/40">
                  <td className="py-3 px-3 font-bold text-brand-text-primary">
                    {channel.channel}
                  </td>
                  <td className="py-3 px-3 text-center text-brand-text-primary">
                    {channel.total}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-emerald-600">
                    {channel.converted}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-accent">
                    {channel.rate}%
                  </td>
                </tr>
              ))}

              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td className="py-3 px-3">TOTAL KESELURUHAN</td>
                <td className="py-3 px-3 text-center">{leadConversionStats.total}</td>
                <td className="py-3 px-3 text-center text-emerald-600">
                  {leadConversionStats.converted}
                </td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {leadConversionStats.rate}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConversionReport;
