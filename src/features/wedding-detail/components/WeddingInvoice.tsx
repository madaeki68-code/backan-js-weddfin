import React from 'react';
import { Project, Client, Package, Profile, PaymentStatus } from '../../../types';
import { WeddingFinancialSummary } from '../types/weddingDetail.types';
import { formatCurrency } from '../../../utils/currency';
import { FileText, Printer, Share2, MessageSquare, CheckCircle, CreditCard, Sparkles } from 'lucide-react';
import { generateWhatsAppLink } from '../../../utils/whatsapp';
import { getBusinessConfig } from '../../settings';

interface WeddingInvoiceProps {
  client: Client;
  activeProject: Project | null;
  selectedPackage: Package | null;
  financial: WeddingFinancialSummary;
  profile: Profile;
  onViewInvoice: (project: Project) => void;
  onNavigateToPayment: () => void;
}

export const WeddingInvoice: React.FC<WeddingInvoiceProps> = ({
  client,
  activeProject,
  selectedPackage,
  financial,
  profile,
  onViewInvoice,
  onNavigateToPayment,
}) => {
  if (!activeProject) {
    return (
      <div className="py-12 text-center text-xs text-brand-text-secondary bg-white rounded-2xl border border-brand-border">
        Pilih atau buat acara pernikahan untuk melihat invoice.
      </div>
    );
  }

  const invoiceNumber = `INV-${activeProject.id.slice(0, 8).toUpperCase()}`;
  const todayStr = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const basePrice = selectedPackage?.price || activeProject.packagePrice || activeProject.totalCost || 0;
  const projectAddOns = activeProject.addOns || [];
  const extraCharges = activeProject.extraCharges || [];

  const businessConfig = getBusinessConfig(profile);
  const phone = client.whatsapp || client.phone;
  const invoiceShareMessage = `Halo Kak ${client.name},\n\nBerikut ringkasan tagihan acara pernikahan "${activeProject.projectName}" bersama ${businessConfig.companyName}:\n\n- No. Invoice: ${invoiceNumber}\n- Total Tagihan: ${formatCurrency(financial.totalCost)}\n- Sudah Terbayar: ${formatCurrency(financial.amountPaid)}\n- Sisa Pembayaran: ${formatCurrency(financial.remainingBalance)}\n\nStatus: ${financial.paymentStatus === PaymentStatus.LUNAS ? 'LUNAS ✅' : 'Menunggu Pelunasan ⏳'}\n\nTerima kasih atas kepercayaannya! 🙏🏻`;
  const whatsappUrl = phone ? generateWhatsAppLink(phone, invoiceShareMessage) : null;

  return (
    <div className="space-y-6">
      {/* ── Invoice Action Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-text-secondary">
            Invoice Resmi
          </span>
          <h3 className="text-base font-bold text-brand-text-primary">
            No: {invoiceNumber}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Kirim Tagihan WA</span>
            </a>
          )}

          <button
            type="button"
            onClick={() => onViewInvoice(activeProject)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Lihat / Cetak PDF</span>
          </button>
        </div>
      </div>

      {/* ── Invoice Document Card Preview ───────────────────────────────── */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white border border-brand-border shadow-sm text-xs text-brand-text-primary">
        {/* Invoice Header */}
        <div className="flex flex-col sm:flex-row justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-xl font-black text-brand-text-primary">
              {businessConfig.companyName}
            </h2>
            <p className="text-slate-500 mt-1">Wedding Photography & Cinematography</p>
            {profile.phone && <p className="text-slate-500">Telp/WA: {profile.phone}</p>}
            {profile.email && <p className="text-slate-500">Email: {profile.email}</p>}
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              INVOICE TAGIHAN
            </span>
            <span className="text-lg font-black text-brand-accent block mt-0.5">{invoiceNumber}</span>
            <p className="text-slate-500 mt-1">Tanggal: {todayStr}</p>
            <span
              className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                financial.paymentStatus === PaymentStatus.LUNAS
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {financial.paymentStatus}
            </span>
          </div>
        </div>

        {/* Billed To */}
        <div className="mb-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
            Ditagihkan Kepada:
          </span>
          <p className="text-sm font-bold text-brand-text-primary">{client.name}</p>
          <p className="text-slate-600 mt-0.5">
            Acara: {activeProject.projectName} • {activeProject.location || 'Lokasi menyusul'}
          </p>
          {client.whatsapp && <p className="text-slate-500">WhatsApp: {client.whatsapp}</p>}
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b-2 border-slate-800 text-slate-700 font-bold uppercase text-[11px]">
                <th className="py-2.5 px-3">Deskripsi Item</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Harga</th>
                <th className="py-2.5 px-3 text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {/* Base Package */}
              <tr>
                <td className="py-3 px-3">
                  <span className="font-bold block">
                    Paket: {selectedPackage?.name || activeProject.packageName || 'Paket Wedding'}
                  </span>
                  {selectedPackage?.items?.length ? (
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      {selectedPackage.items.join(', ')}
                    </span>
                  ) : null}
                </td>
                <td className="py-3 px-3 text-center">1</td>
                <td className="py-3 px-3 text-right">{formatCurrency(basePrice)}</td>
                <td className="py-3 px-3 font-bold text-right">{formatCurrency(basePrice)}</td>
              </tr>

              {/* Add-Ons */}
              {projectAddOns.map((item, i) => (
                <tr key={`addon-${i}`}>
                  <td className="py-3 px-3">
                    <span className="font-medium block">Add-On: {item.name}</span>
                  </td>
                  <td className="py-3 px-3 text-center">1</td>
                  <td className="py-3 px-3 text-right">{formatCurrency(item.price)}</td>
                  <td className="py-3 px-3 font-bold text-right">{formatCurrency(item.price)}</td>
                </tr>
              ))}

              {/* Extra Charges */}
              {extraCharges.map(charge => (
                <tr key={charge.id}>
                  <td className="py-3 px-3">
                    <span className="font-medium block">Biaya Tambahan: {charge.name}</span>
                  </td>
                  <td className="py-3 px-3 text-center">1</td>
                  <td className="py-3 px-3 text-right">{formatCurrency(charge.amount)}</td>
                  <td className="py-3 px-3 font-bold text-right">{formatCurrency(charge.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex flex-col sm:flex-row justify-between pt-4 border-t-2 border-slate-800 gap-4">
          <div className="text-slate-500 text-[11px] space-y-1">
            <p className="font-bold text-slate-700">Ketentuan Pembayaran:</p>
            <p>• DP minimal sesuai kesepakatan untuk mengunci tanggal acara.</p>
            <p>• Pelunasan wajib diselesaikan maksimal sebelum penyerahan hasil akhir.</p>
          </div>

          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Subtotal</span>
              <span className="font-bold text-slate-800">{formatCurrency(financial.totalCost)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 text-emerald-700">
              <span className="font-medium">Sudah Dibayar</span>
              <span className="font-bold">-{formatCurrency(financial.amountPaid)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-black">
              <span>Sisa Tagihan</span>
              <span className={financial.remainingBalance > 0 ? 'text-amber-700' : 'text-emerald-700'}>
                {formatCurrency(financial.remainingBalance)}
              </span>
            </div>

            {financial.remainingBalance > 0 && (
              <button
                type="button"
                onClick={onNavigateToPayment}
                className="w-full mt-2 py-2 px-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold text-center transition-all cursor-pointer"
              >
                Bayar Sekarang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingInvoice;
