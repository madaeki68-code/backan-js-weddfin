import React from 'react';
import Modal from '../../../shared/ui/Modal';
import { Client, Project, ClientFeedback, SatisfactionLevel } from '../../../types';
import {
  StatModalType,
  CityStat,
  PackageStat,
  TeamStat,
  LeadConversionStat,
  TypeReportStats,
} from '../types/businessReports.types';
import { formatCurrency, extractCityFromAddress } from '../../clients/utils/clientFormatters';

interface ReportsStatModalProps {
  activeStatModal: StatModalType;
  onClose: () => void;
  clients: Client[];
  filteredProjects: Project[];
  typeStats: TypeReportStats;
  cityStats: CityStat[];
  packageStats: PackageStat[];
  teamStats: TeamStat[];
  leadConversionStats: LeadConversionStat;
  feedback: ClientFeedback[];
}

export const ReportsStatModal: React.FC<ReportsStatModalProps> = ({
  activeStatModal,
  onClose,
  clients,
  filteredProjects,
  typeStats,
  cityStats,
  packageStats,
  teamStats,
  leadConversionStats,
  feedback,
}) => {
  if (!activeStatModal) return null;

  let title = 'Detail Statistik';
  let content = null;

  if (activeStatModal === 'total' || activeStatModal === 'active') {
    title = 'Daftar Pengantin';
    content = (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto">
        {clients.map(client => {
          const totalVal = filteredProjects
            .filter(p => p.clientId === client.id)
            .reduce((sum, p) => sum + p.totalCost, 0);

          return (
            <div
              key={client.id}
              className="flex items-center justify-between p-3 rounded-xl bg-brand-bg border border-brand-border text-xs"
            >
              <div>
                <span className="font-bold text-brand-text-primary block">{client.name}</span>
                <span className="text-brand-text-secondary">
                  {extractCityFromAddress(client.address || client.homeAddress || '')} · {client.phone || client.email || '-'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-bold text-brand-accent block">{formatCurrency(totalVal)}</span>
                <span className="text-[10px] text-brand-text-secondary">{client.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  } else if (activeStatModal === 'direct-vendor') {
    title = 'Statistik Pengantin Langsung vs Vendor';
    content = (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="font-bold text-emerald-800 block">Langsung (Direct):</span>
            <span className="text-lg font-black text-emerald-700">
              {typeStats.typeReportDirectClients.length} Pengantin
            </span>
            <span className="text-brand-text-secondary block mt-1">
              Omzet: {formatCurrency(typeStats.typeReportDirectRevenue)} ({typeStats.typeReportDirectRevenueShare}%)
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
            <span className="font-bold text-sky-800 block">Vendor / WO:</span>
            <span className="text-lg font-black text-sky-700">
              {typeStats.typeReportVendorClients.length} Pengantin
            </span>
            <span className="text-brand-text-secondary block mt-1">
              Omzet: {formatCurrency(typeStats.typeReportVendorRevenue)} ({typeStats.typeReportVendorRevenueShare}%)
            </span>
          </div>
        </div>
      </div>
    );
  } else if (activeStatModal === 'top-cities') {
    title = 'Peringkat Seluruh Kota & Daerah';
    content = (
      <div className="overflow-x-auto max-h-[60vh] rounded-xl border border-brand-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-bg text-brand-text-secondary font-bold">
            <tr>
              <th className="py-2.5 px-3 text-center">#</th>
              <th className="py-2.5 px-3">Kota / Daerah</th>
              <th className="py-2.5 px-3 text-center">Pengantin</th>
              <th className="py-2.5 px-3 text-center">Acara</th>
              <th className="py-2.5 px-3 text-right">Omzet</th>
              <th className="py-2.5 px-3 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {cityStats.map((c, idx) => (
              <tr key={c.name} className="hover:bg-brand-bg/40">
                <td className="py-2.5 px-3 text-center text-brand-text-secondary">{idx + 1}</td>
                <td className="py-2.5 px-3 font-bold text-brand-text-primary">{c.name}</td>
                <td className="py-2.5 px-3 text-center">{c.clientCount}</td>
                <td className="py-2.5 px-3 text-center">{c.projectCount}</td>
                <td className="py-2.5 px-3 text-right font-bold text-brand-accent">
                  {formatCurrency(c.totalRevenue)}
                </td>
                <td className="py-2.5 px-3 text-right">{c.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (activeStatModal === 'top-packages') {
    title = 'Rekapitulasi Paket Layanan';
    content = (
      <div className="overflow-x-auto max-h-[60vh] rounded-xl border border-brand-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-bg text-brand-text-secondary font-bold">
            <tr>
              <th className="py-2.5 px-3 text-center">#</th>
              <th className="py-2.5 px-3">Nama Paket</th>
              <th className="py-2.5 px-3 text-center">Pesanan</th>
              <th className="py-2.5 px-3 text-right">Total Omzet</th>
              <th className="py-2.5 px-3 text-right">Kontribusi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {packageStats.map((p, idx) => (
              <tr key={p.name} className="hover:bg-brand-bg/40">
                <td className="py-2.5 px-3 text-center text-brand-text-secondary">{idx + 1}</td>
                <td className="py-2.5 px-3 font-bold text-brand-text-primary">{p.name}</td>
                <td className="py-2.5 px-3 text-center">{p.orderCount}x</td>
                <td className="py-2.5 px-3 text-right font-bold text-brand-accent">
                  {formatCurrency(p.totalOmzet)}
                </td>
                <td className="py-2.5 px-3 text-right">{p.revenueContribution.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (activeStatModal === 'top-team') {
    title = 'Kinerja & Honor Anggota Tim';
    content = (
      <div className="overflow-x-auto max-h-[60vh] rounded-xl border border-brand-border">
        <table className="w-full text-xs text-left">
          <thead className="bg-brand-bg text-brand-text-secondary font-bold">
            <tr>
              <th className="py-2.5 px-3 text-center">#</th>
              <th className="py-2.5 px-3">Nama Anggota</th>
              <th className="py-2.5 px-3">Peran</th>
              <th className="py-2.5 px-3 text-center">Job</th>
              <th className="py-2.5 px-3 text-right">Total Honor</th>
              <th className="py-2.5 px-3 text-right">Terbayar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border/40">
            {teamStats.map((tm, idx) => (
              <tr key={tm.id || idx} className="hover:bg-brand-bg/40">
                <td className="py-2.5 px-3 text-center text-brand-text-secondary">{idx + 1}</td>
                <td className="py-2.5 px-3 font-bold text-brand-text-primary">{tm.name}</td>
                <td className="py-2.5 px-3 text-brand-text-secondary">{tm.role}</td>
                <td className="py-2.5 px-3 text-center">{tm.jobCount} job</td>
                <td className="py-2.5 px-3 text-right font-bold text-brand-accent">
                  {formatCurrency(tm.totalFee)}
                </td>
                <td className="py-2.5 px-3 text-right text-emerald-600">
                  {formatCurrency(tm.paidFee)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  } else if (activeStatModal === 'lead-conversion') {
    title = 'Detail Konversi Calon Pengantin (Leads)';
    content = (
      <div className="space-y-4">
        <div className="p-3.5 rounded-xl bg-brand-bg border border-brand-border text-xs">
          <span className="font-bold text-brand-text-primary block mb-1">Funnel Konversi:</span>
          <p className="text-brand-text-secondary leading-relaxed">
            Dari total {leadConversionStats.total} prospek yang masuk, sebanyak{' '}
            <strong className="text-emerald-600">{leadConversionStats.converted} calon</strong> berhasil closing menjadi klien pengantin resmi (Tingkat closing: {leadConversionStats.rate}%).
          </p>
        </div>
      </div>
    );
  } else {
    // Feedback level
    const levelMap: Record<string, SatisfactionLevel> = {
      'very-satisfied': SatisfactionLevel.VERY_SATISFIED,
      'satisfied': SatisfactionLevel.SATISFIED,
      'neutral': SatisfactionLevel.NEUTRAL,
      'unsatisfied': SatisfactionLevel.UNSATISFIED,
    };
    const targetLevel = levelMap[activeStatModal];
    const filteredReviews = feedback.filter(f => f.satisfaction === targetLevel);
    title = `Ulasan: ${targetLevel || 'Testimoni'}`;
    content = (
      <div className="space-y-3 max-h-[60vh] overflow-y-auto text-xs">
        {filteredReviews.length === 0 ? (
          <p className="text-brand-text-secondary text-center py-4">Tidak ada ulasan pada kategori ini.</p>
        ) : (
          filteredReviews.map(item => (
            <div key={item.id} className="p-3.5 rounded-xl bg-brand-bg border border-brand-border">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-brand-text-primary">{item.clientName}</span>
                <span className="text-[10px] text-brand-text-secondary">
                  {item.date ? new Date(item.date).toLocaleDateString('id-ID') : '-'}
                </span>
              </div>
              <p className="text-brand-text-secondary italic">&ldquo;{item.feedback}&rdquo;</p>
            </div>
          ))
        )}
      </div>
    );
  }

  return (
    <Modal isOpen={Boolean(activeStatModal)} onClose={onClose} title={title} size="2xl">
      {content}
    </Modal>
  );
};

export default ReportsStatModal;
