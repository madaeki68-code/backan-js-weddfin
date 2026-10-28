import React from 'react';
import { TeamStat } from '../types/businessReports.types';
import { formatCurrency } from '../../clients/utils/clientFormatters';
import { BriefcaseIcon } from '../../../constants';

interface TeamReportProps {
  teamStats: TeamStat[];
  teamTableTotals: { jobs: number; fees: number; paid: number; unpaid: number };
}

export const TeamReport: React.FC<TeamReportProps> = ({ teamStats, teamTableTotals }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <h4 className="text-sm font-bold text-brand-text-primary mb-1 flex items-center gap-2">
          <BriefcaseIcon className="w-4 h-4 text-brand-accent" />
          Performa Tim & Pembayaran Honor
        </h4>
        <p className="text-xs text-brand-text-secondary mb-4">
          Rekapitulasi penugasan kru fotografi, videografi, pilot drone, dan vendor serta status pembayaran honorarium.
        </p>

        <div className="overflow-x-auto rounded-xl border border-brand-border/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3">Nama Anggota Tim</th>
                <th className="py-2.5 px-3">Peran / Kategori</th>
                <th className="py-2.5 px-3 text-center">Jumlah Job</th>
                <th className="py-2.5 px-3 text-right">Total Honor</th>
                <th className="py-2.5 px-3 text-right">Terbayar</th>
                <th className="py-2.5 px-3 text-right">Sisa Belum Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {teamStats.map((member, idx) => (
                <tr key={member.id || idx} className="hover:bg-brand-bg/40">
                  <td className="py-3 px-3 text-center font-bold text-brand-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-brand-text-primary whitespace-nowrap">
                    {member.name}
                  </td>
                  <td className="py-3 px-3 text-brand-text-secondary">
                    {member.role} ({member.category})
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-brand-text-primary">
                    {member.jobCount} job
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-accent">
                    {formatCurrency(member.totalFee)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    {formatCurrency(member.paidFee)}
                  </td>
                  <td
                    className={`py-3 px-3 text-right font-bold ${
                      member.unpaidFee > 0 ? 'text-amber-600' : 'text-slate-400'
                    }`}
                  >
                    {formatCurrency(member.unpaidFee)}
                  </td>
                </tr>
              ))}

              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td colSpan={3} className="py-3 px-3">
                  TOTAL
                </td>
                <td className="py-3 px-3 text-center">{teamTableTotals.jobs} job</td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {formatCurrency(teamTableTotals.fees)}
                </td>
                <td className="py-3 px-3 text-right text-emerald-600">
                  {formatCurrency(teamTableTotals.paid)}
                </td>
                <td
                  className={`py-3 px-3 text-right ${
                    teamTableTotals.unpaid > 0 ? 'text-amber-600' : 'text-slate-400'
                  }`}
                >
                  {formatCurrency(teamTableTotals.unpaid)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamReport;
