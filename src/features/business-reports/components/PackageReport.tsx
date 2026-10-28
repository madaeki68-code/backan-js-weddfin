import React from 'react';
import { PackageStat } from '../types/businessReports.types';
import { formatCurrency } from '../../clients/utils/clientFormatters';
import { PackageIcon } from '../../../constants';

interface PackageReportProps {
  packageStats: PackageStat[];
  packageTableTotals: { pricelist: number; orders: number; revenue: number };
  totalRevenue: number;
}

export const PackageReport: React.FC<PackageReportProps> = ({
  packageStats,
  packageTableTotals,
  totalRevenue,
}) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-brand-surface rounded-2xl border border-brand-border">
        <h4 className="text-sm font-bold text-brand-text-primary mb-1 flex items-center gap-2">
          <PackageIcon className="w-4 h-4 text-brand-accent" />
          Rekap Paket & Pricelist Layanan
        </h4>
        <p className="text-xs text-brand-text-secondary mb-4">
          Frekuensi pemesanan paket dokumentasi pernikahan, kontribusi terhadap total omzet, dan harga rata-rata realisasi.
        </p>

        <div className="overflow-x-auto rounded-xl border border-brand-border/60">
          <table className="w-full text-xs text-left">
            <thead className="bg-brand-bg text-brand-text-secondary font-bold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">#</th>
                <th className="py-2.5 px-3">Nama Paket</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3">Wilayah</th>
                <th className="py-2.5 px-3 text-right">Pricelist</th>
                <th className="py-2.5 px-3 text-center">Pesanan</th>
                <th className="py-2.5 px-3 text-right">Total Omzet</th>
                <th className="py-2.5 px-3 text-right">Kontribusi</th>
                <th className="py-2.5 px-3 text-right">Rata-rata Realisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/40">
              {packageStats.map((pkg, idx) => (
                <tr key={pkg.name} className="hover:bg-brand-bg/40">
                  <td className="py-3 px-3 text-center font-bold text-brand-text-secondary">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-bold text-brand-text-primary whitespace-nowrap">
                    {pkg.name}
                  </td>
                  <td className="py-3 px-3 text-brand-text-secondary">{pkg.category}</td>
                  <td className="py-3 px-3 text-brand-text-secondary">{pkg.region}</td>
                  <td className="py-3 px-3 text-right text-brand-text-secondary">
                    {formatCurrency(pkg.pricelistPrice)}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-brand-text-primary">
                    {pkg.orderCount}x
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-accent">
                    {formatCurrency(pkg.totalOmzet)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-brand-text-primary">
                    {pkg.revenueContribution.toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right text-brand-text-secondary">
                    {formatCurrency(pkg.avgRealizedPrice)}
                  </td>
                </tr>
              ))}

              <tr className="bg-brand-bg font-bold border-t-2 border-brand-accent text-brand-text-primary">
                <td colSpan={4} className="py-3 px-3">
                  TOTAL
                </td>
                <td className="py-3 px-3 text-right">
                  {formatCurrency(packageTableTotals.pricelist)}
                </td>
                <td className="py-3 px-3 text-center">{packageTableTotals.orders}x</td>
                <td className="py-3 px-3 text-right text-brand-accent">
                  {formatCurrency(packageTableTotals.revenue)}
                </td>
                <td className="py-3 px-3 text-right">
                  {totalRevenue > 0
                    ? `${((packageTableTotals.revenue / totalRevenue) * 100).toFixed(1)}%`
                    : '-'}
                </td>
                <td className="py-3 px-3 text-right">
                  {packageTableTotals.orders > 0
                    ? formatCurrency(packageTableTotals.revenue / packageTableTotals.orders)
                    : '-'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PackageReport;
