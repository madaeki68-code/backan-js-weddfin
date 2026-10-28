import React from 'react';
import { Client, Project, Package, ClientStatus, ClientType } from '../../../types';
import { TypeReportStats } from '../types/businessReports.types';
import { formatCurrency, extractCityFromAddress } from '../../clients/utils/clientFormatters';
import { buildClientLedger } from '../../clients/utils/clientStats';
import { UsersIcon, MapPinIcon, DollarSignIcon } from '../../../constants';
import TablePagination from '../../../shared/ui/TablePagination';

interface SourceReportProps {
  typeStats: TypeReportStats;
  filteredProjects: Project[];
  packages: Package[];
  clientTransactionTotals: Map<string, { income: number; expense: number; expenses: { projectId: string; label: string; amount: number }[] }>;
  typeReportClientTableTotals: { projectValue: number; expense: number; netProfit: number };
  paginatedClients: Client[];
  totalTableClients: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  // Filters
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'name' | 'date' | 'value' | 'status';
  onSortChange: (sort: 'name' | 'date' | 'value' | 'status') => void;
  clientTypeFilter: 'all' | 'direct' | 'vendor';
  onClientTypeFilterChange: (type: 'all' | 'direct' | 'vendor') => void;
  statusFilter: ClientStatus | 'all';
  onStatusFilterChange: (status: ClientStatus | 'all') => void;
}

export const SourceReport: React.FC<SourceReportProps> = ({
  typeStats,
  filteredProjects,
  packages,
  clientTransactionTotals,
  typeReportClientTableTotals,
  paginatedClients,
  totalTableClients,
  currentPage,
  itemsPerPage,
  totalPages,
  onPageChange,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  clientTypeFilter,
  onClientTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
}) => {
  return (
    <div className="space-y-4">
      {/* ── Summary Direct vs Vendor Breakdown ──────────────────────────── */}
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <h4 className="text-sm font-bold text-brand-text-primary mb-3">
          Rekap Tipe Klien: Langsung (Direct) vs Rekanan Vendor
        </h4>

        <div className="overflow-x-auto rounded-xl border border-brand-border/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-2.5 px-3">Tipe Klien</th>
                <th className="py-2.5 px-3 text-center">Pengantin</th>
                <th className="py-2.5 px-3 text-center">Total Acara</th>
                <th className="py-2.5 px-3 text-right">Omzet</th>
                <th className="py-2.5 px-3 text-right">Rata-rata / Acara</th>
                <th className="py-2.5 px-3 text-right">Share Omzet</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              <tr className="hover:bg-brand-bg/40">
                <td className="py-3 px-3 font-bold text-emerald-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Langsung (Direct)
                </td>
                <td className="py-3 px-3 text-center font-bold text-brand-text-primary">
                  {typeStats.typeReportDirectClients.length}
                </td>
                <td className="py-3 px-3 text-center text-brand-text-secondary">
                  {typeStats.typeReportDirectProjects.length}
                </td>
                <td className="py-3 px-3 text-right font-bold text-emerald-600">
                  {formatCurrency(typeStats.typeReportDirectRevenue)}
                </td>
                <td className="py-3 px-3 text-right text-brand-text-secondary">
                  {formatCurrency(typeStats.typeReportAvgDirectRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-bold text-brand-text-primary">
                  {typeStats.typeReportDirectRevenueShare}%
                </td>
              </tr>

              <tr className="hover:bg-brand-bg/40">
                <td className="py-3 px-3 font-bold text-sky-600 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> Vendor / Rekanan
                </td>
                <td className="py-3 px-3 text-center font-bold text-brand-text-primary">
                  {typeStats.typeReportVendorClients.length}
                </td>
                <td className="py-3 px-3 text-center text-brand-text-secondary">
                  {typeStats.typeReportVendorProjects.length}
                </td>
                <td className="py-3 px-3 text-right font-bold text-sky-600">
                  {formatCurrency(typeStats.typeReportVendorRevenue)}
                </td>
                <td className="py-3 px-3 text-right text-brand-text-secondary">
                  {formatCurrency(typeStats.typeReportAvgVendorRevenue)}
                </td>
                <td className="py-3 px-3 text-right font-bold text-brand-text-primary">
                  {typeStats.typeReportVendorRevenueShare}%
                </td>
              </tr>

              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td className="py-3 px-3">TOTAL</td>
                <td className="py-3 px-3 text-center">{typeStats.typeReportClients.length}</td>
                <td className="py-3 px-3 text-center">{typeStats.typeReportProjects.length}</td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {formatCurrency(typeStats.typeReportRevenue)}
                </td>
                <td className="py-3 px-3 text-right">
                  {formatCurrency(typeStats.typeReportAvgRevenuePerClient)}
                </td>
                <td className="py-3 px-3 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Filter Toolbar for Ledger List ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-brand-surface rounded-2xl border border-brand-border text-xs">
        <div className="flex-1 flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Cari nama pengantin, email, alamat..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text-primary outline-none focus:border-brand-accent"
          />

          <select
            value={clientTypeFilter}
            onChange={e => onClientTypeFilterChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text-primary"
          >
            <option value="all">Semua Tipe</option>
            <option value="direct">Langsung (Direct)</option>
            <option value="vendor">Vendor / Rekanan</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text-primary"
          >
            <option value="all">Semua Status</option>
            {Object.values(ClientStatus).map(s => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={e => onSortChange(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-brand-bg border border-brand-border text-brand-text-primary"
          >
            <option value="date">Urutkan: Tanggal Terdaftar</option>
            <option value="name">Urutkan: Nama</option>
            <option value="value">Urutkan: Nilai Omzet</option>
            <option value="status">Urutkan: Status</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('card')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'card'
                ? 'bg-brand-accent text-white'
                : 'bg-brand-bg text-brand-text-secondary border border-brand-border'
            }`}
          >
            Cards
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              viewMode === 'table'
                ? 'bg-brand-accent text-white'
                : 'bg-brand-bg text-brand-text-secondary border border-brand-border'
            }`}
          >
            Tabel
          </button>
        </div>
      </div>

      {/* ── Table Mode ──────────────────────────────────────────────────── */}
      {viewMode === 'table' ? (
        <div className="overflow-x-auto rounded-2xl border border-brand-border bg-brand-surface">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-3 px-3">Pengantin</th>
                <th className="py-3 px-3">Tipe</th>
                <th className="py-3 px-3">Kota / Daerah</th>
                <th className="py-3 px-3">Rincian Paket Acara</th>
                <th className="py-3 px-3 text-right">Nilai Total</th>
                <th className="py-3 px-3 text-right">Biaya Produksi</th>
                <th className="py-3 px-3 text-right">Laba Bersih</th>
                <th className="py-3 px-3 text-center">Status Bayar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {paginatedClients.map(client => {
                const ledger = buildClientLedger(
                  client,
                  filteredProjects,
                  packages,
                  clientTransactionTotals.get(client.id) || { income: 0, expense: 0, expenses: [] }
                );

                return (
                  <tr key={client.id} className="hover:bg-brand-bg/40">
                    <td className="py-3 px-3">
                      <span className="font-bold text-brand-text-primary block">{client.name}</span>
                      <span className="text-[10px] text-brand-text-secondary">
                        {client.phone || client.email || '-'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          ledger.isDirect ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                        }`}
                      >
                        {ledger.isDirect ? 'Langsung' : 'Vendor'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-brand-text-secondary">
                      {extractCityFromAddress(client.address || client.homeAddress || '')}
                    </td>
                    <td className="py-3 px-3">
                      {ledger.projectCostDetails.length > 0 ? (
                        ledger.projectCostDetails.map((proj, idx) => (
                          <div key={idx} className="text-[11px] mb-1">
                            <span className="font-semibold text-brand-text-primary">{proj.name}: </span>
                            <span className="text-brand-text-secondary">{formatCurrency(proj.total)}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-brand-text-secondary">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-brand-text-primary">
                      {formatCurrency(ledger.totalVal)}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-rose-600">
                      {formatCurrency(ledger.expenseTotal)}
                    </td>
                    <td
                      className={`py-3 px-3 text-right font-bold ${
                        ledger.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(ledger.netProfit)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ledger.payStatus === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {ledger.payStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Total row */}
              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td colSpan={4} className="py-3 px-3">
                  TOTAL ({totalTableClients} Pengantin)
                </td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {formatCurrency(typeReportClientTableTotals.projectValue)}
                </td>
                <td className="py-3 px-3 text-right text-rose-600">
                  {formatCurrency(typeReportClientTableTotals.expense)}
                </td>
                <td
                  className={`py-3 px-3 text-right ${
                    typeReportClientTableTotals.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {formatCurrency(typeReportClientTableTotals.netProfit)}
                </td>
                <td className="py-3 px-3" />
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        /* ── Card Mode ─────────────────────────────────────────────────── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {paginatedClients.map(client => {
            const ledger = buildClientLedger(
              client,
              filteredProjects,
              packages,
              clientTransactionTotals.get(client.id) || { income: 0, expense: 0, expenses: [] }
            );

            return (
              <div
                key={client.id}
                className="p-4 rounded-2xl bg-brand-surface border border-brand-border/70 hover:border-brand-accent/40 transition-all text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="font-bold text-sm text-brand-text-primary block">
                        {client.name}
                      </span>
                      <span className="text-[10px] text-brand-text-secondary">
                        {extractCityFromAddress(client.address || client.homeAddress || '')} ·{' '}
                        {client.phone || client.email || '-'}
                      </span>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        ledger.isDirect ? 'bg-emerald-100 text-emerald-800' : 'bg-sky-100 text-sky-800'
                      }`}
                    >
                      {ledger.isDirect ? 'Langsung' : 'Vendor'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-brand-bg border border-brand-border/60 my-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-brand-text-secondary">Total Nilai Acara:</span>
                      <span className="font-bold text-brand-text-primary">
                        {formatCurrency(ledger.totalVal)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-text-secondary">Biaya Produksi:</span>
                      <span className="font-bold text-rose-600">
                        {formatCurrency(ledger.expenseTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t border-brand-border/40 pt-1">
                      <span className="text-brand-text-primary font-bold">Laba Bersih:</span>
                      <span
                        className={`font-black ${
                          ledger.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {formatCurrency(ledger.netProfit)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-2 border-t border-brand-border/40">
                  <span className="text-brand-text-secondary">
                    Terdaftar: {new Date(client.since).toLocaleDateString('id-ID')}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      ledger.payStatus === 'LUNAS'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ledger.payStatus}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <TablePagination
          currentPage={currentPage}
          totalItems={totalTableClients}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
};

export default SourceReport;
