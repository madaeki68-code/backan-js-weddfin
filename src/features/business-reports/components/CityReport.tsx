import React from 'react';
import { CityStat } from '../types/businessReports.types';
import { formatCurrency } from '../../clients/utils/clientFormatters';
import { MapPinIcon } from '../../../constants';

interface CityReportProps {
  cityStats: CityStat[];
  cityTableTotals: { clients: number; leads: number; projects: number; revenue: number };
}

export const CityReport: React.FC<CityReportProps> = ({ cityStats, cityTableTotals }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <h4 className="text-sm font-bold text-brand-text-primary mb-1 flex items-center gap-2">
          <MapPinIcon className="w-4 h-4 text-brand-accent" />
          Peringkat Daerah & Kota Pengantin
        </h4>
        <p className="text-xs text-brand-text-secondary mb-4">
          Persebaran lokasi domisili pengantin, prospek calon pengantin, dan akumulasi omzet per daerah.
        </p>

        <div className="overflow-x-auto rounded-xl border border-brand-border/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3">Nama Daerah / Kota</th>
                <th className="py-2.5 px-3 text-center">Pengantin</th>
                <th className="py-2.5 px-3 text-center">Calon (Leads)</th>
                <th className="py-2.5 px-3 text-center">Total Acara</th>
                <th className="py-2.5 px-3 text-right">Total Nilai Acara</th>
                <th className="py-2.5 px-3 text-right">Share %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {cityStats.map((city, idx) => (
                <tr key={city.name} className="hover:bg-brand-bg/40">
                  <td className="py-3 px-3 text-center font-bold text-brand-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-brand-text-primary whitespace-nowrap">
                    {city.name}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-brand-text-primary">
                    {city.clientCount}
                  </td>
                  <td className="py-3 px-3 text-center text-brand-text-secondary">
                    {city.leadCount}
                  </td>
                  <td className="py-3 px-3 text-center text-brand-text-secondary">
                    {city.projectCount}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-accent">
                    {formatCurrency(city.totalRevenue)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-text-primary">
                    {city.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}

              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td colSpan={2} className="py-3 px-3">
                  TOTAL
                </td>
                <td className="py-3 px-3 text-center">{cityTableTotals.clients}</td>
                <td className="py-3 px-3 text-center">{cityTableTotals.leads}</td>
                <td className="py-3 px-3 text-center">{cityTableTotals.projects}</td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {formatCurrency(cityTableTotals.revenue)}
                </td>
                <td className="py-3 px-3 text-right">
                  {cityTableTotals.clients > 0 ? '100.0%' : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CityReport;
