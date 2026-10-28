import React, { useState } from 'react';
import { Client, Project, Package, Transaction, TransactionType } from '../../../types';
import { WeddingFinancialSummary, WeddingProgressSummary, WeddingDetailTab } from '../types/weddingDetail.types';
import { ProjectMeeting } from '../../../services/calendarEvents';
import { formatCurrency } from '../../../utils/currency';
import { generateWhatsAppLink } from '../../../utils/whatsapp';
import {
  DollarSignIcon,
  CheckIcon,
  FolderKanbanIcon,
  CalendarIcon,
  UsersIcon,
  FileTextIcon,
} from '../../../constants';
import {
  CalendarClock,
  ArrowRight,
  TrendingUp,
  CreditCard,
  Heart,
  MapPin,
  Clock,
  AlertTriangle,
  Instagram,
  Mail,
  Phone,
  Home,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Package as PackageIcon,
  FileCheck,
  UserCheck,
  Pencil,
  Truck,
} from 'lucide-react';

export interface WeddingOverviewProps {
  client: Client;
  activeProject: Project | null;
  selectedPackage: Package | null;
  financial: WeddingFinancialSummary;
  progress: WeddingProgressSummary;
  meetings: ProjectMeeting[];
  projectTransactions: Transaction[];
  onNavigateTab: (tab: WeddingDetailTab) => void;
  onViewInvoice: (project: Project) => void;
  onEditClient?: (client: Client) => void;
}

export const WeddingOverview: React.FC<WeddingOverviewProps> = ({
  client,
  activeProject,
  selectedPackage,
  financial,
  progress,
  meetings,
  projectTransactions,
  onNavigateTab,
  onViewInvoice,
  onEditClient,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  const nextMeeting = meetings
    .filter(m => {
      const d = m.event.date || m.event.startAt.split('T')[0];
      return new Date(d).getTime() >= new Date().setHours(0, 0, 0, 0);
    })
    .sort((a, b) => {
      const dA = a.event.date || a.event.startAt.split('T')[0];
      const dB = b.event.date || b.event.startAt.split('T')[0];
      return new Date(dA).getTime() - new Date(dB).getTime();
    })[0];

  const recentTransactions = [...projectTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const phone = client.whatsapp || client.phone;
  const whatsappUrl = phone
    ? generateWhatsAppLink(
        phone,
        `Halo Kak ${client.name}, ini mengenai rencana acara ${activeProject?.projectName || 'pernikahan'}.`
      )
    : null;

  const instagramHandle = client.instagram ? client.instagram.replace(/^@/, '').trim() : '';

  const handleCopy = (text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const deliveryAddress = client.homeAddress || client.address;

  return (
    <div className="space-y-6">
      {/* ── Financial KPI Stat Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Cost */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs hover:border-brand-accent/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Total Nilai Acara
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-accent/10 text-brand-accent flex items-center justify-center">
              <DollarSignIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-black text-brand-text-primary">
            {formatCurrency(financial.totalCost)}
          </p>
          <p className="text-[11px] text-brand-text-secondary mt-1 truncate">
            {activeProject?.packageName || 'Paket Kustom'}
          </p>
        </div>

        {/* Amount Paid */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Sudah Terbayar
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-black text-emerald-600">
            {formatCurrency(financial.amountPaid)}
          </p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{
                width: `${financial.totalCost > 0 ? Math.min(100, Math.round((financial.amountPaid / financial.totalCost) * 100)) : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs hover:border-amber-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Sisa Tagihan
            </span>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                financial.remainingBalance > 0 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-base sm:text-xl font-black ${
              financial.remainingBalance > 0 ? 'text-amber-600' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(financial.remainingBalance)}
          </p>
          <p className="text-[11px] text-brand-text-secondary mt-1">
            {financial.remainingBalance === 0 ? 'Lunas Sepenuhnya' : 'Menunggu Pelunasan'}
          </p>
        </div>

        {/* Estimated Profit */}
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs hover:border-blue-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-secondary">
              Estimasi Laba
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-brand-accent flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-xl font-black text-brand-text-primary">
            {formatCurrency(financial.estimatedProfit)}
          </p>
          <p className="text-[11px] text-brand-text-secondary mt-1">
            Margin: {financial.totalCost > 0 ? Math.round((financial.estimatedProfit / financial.totalCost) * 100) : 0}%
          </p>
        </div>
      </div>

      {/* ── Overdue Warning if any ───────────────────────────────────────── */}
      {financial.isOverdue && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 animate-fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <div className="text-xs">
            <span className="font-bold">Perhatian: Acara telah lewat {financial.overdueDays} hari.</span> Pastikan
            file hasil dokumentasi telah diserahkan atau tandai tahapan acara sebagai selesai.
          </div>
        </div>
      )}

      {/* ── Main Two-Column Summary ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left 2 Cols: Primary Details ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Client & Contact Information Card */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Informasi Pasangan & Kontak
                </h3>
              </div>
              {onEditClient && (
                <button
                  type="button"
                  onClick={() => onEditClient(client)}
                  className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Ubah Data</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Couple Name */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Nama Pasangan Pengantin
                </span>
                <span className="text-sm font-bold text-brand-text-primary block">
                  {client.name}
                </span>
                <span className="text-[11px] text-brand-text-secondary mt-1">
                  Status: {client.status || 'Klien Aktif'}
                </span>
              </div>

              {/* Phone & WhatsApp */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  WhatsApp & Telepon
                </span>
                {phone ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-brand-text-primary truncate">
                      {phone}
                    </span>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors"
                          title="Chat WhatsApp"
                        >
                          <Phone className="w-3.5 h-3.5 rotate-90" />
                        </a>
                      )}
                      <a
                        href={`tel:${phone}`}
                        className="p-1.5 rounded-lg bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors"
                        title="Panggil Telepon"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Belum diisi</span>
                )}
                <span className="text-[10px] text-brand-text-secondary mt-1">
                  {phone ? 'Dapat dihubungi via WA' : 'Kontak belum tersedia'}
                </span>
              </div>

              {/* Email */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Email
                </span>
                {client.email ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-brand-text-primary truncate" title={client.email}>
                      {client.email}
                    </span>
                    <a
                      href={`mailto:${client.email}`}
                      className="p-1.5 rounded-lg bg-slate-200/70 text-slate-700 hover:bg-slate-300 transition-colors flex-shrink-0"
                      title="Kirim Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Belum diisi</span>
                )}
                <span className="text-[10px] text-brand-text-secondary mt-1">
                  {client.email ? 'Untuk pengiriman invoice' : 'Email belum dicatat'}
                </span>
              </div>

              {/* Instagram */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Instagram Pengantin
                </span>
                {instagramHandle ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-pink-600 truncate">
                      @{instagramHandle}
                    </span>
                    <a
                      href={`https://instagram.com/${instagramHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg bg-pink-50 text-pink-600 hover:bg-pink-100 transition-colors flex-shrink-0"
                      title="Buka Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Belum diisi</span>
                )}
                <span className="text-[10px] text-brand-text-secondary mt-1">
                  {instagramHandle ? 'Untuk tagging media sosial' : 'Akun IG belum dicatat'}
                </span>
              </div>
            </div>

            {/* Delivery / Home Address for Album Shipping */}
            <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
              <div className="flex items-start gap-2.5">
                <Home className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                    Alamat Rumah Pengantin (Pengiriman Album & Flashdisk)
                  </span>
                  <p className="text-brand-text-primary font-medium mt-0.5 leading-relaxed">
                    {deliveryAddress || 'Alamat pengiriman fisik belum diisi oleh pengantin.'}
                  </p>
                  {activeProject?.shippingDetails && (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[11px] font-semibold text-slate-700">
                      <Truck className="w-3.5 h-3.5 text-brand-accent" />
                      <span>Resi / Ekspedisi: {activeProject.shippingDetails}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Event & Venue Detail Card */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Waktu & Lokasi Acara
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('schedule')}
                className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Jadwal & Rundown</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Event Date */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Hari & Tanggal Acara
                </span>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-brand-accent flex-shrink-0" />
                  <span className="text-sm font-bold text-brand-text-primary">
                    {activeProject?.date
                      ? new Date(activeProject.date).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })
                      : 'Belum ditentukan'}
                  </span>
                </div>
              </div>

              {/* Ceremony Hours */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                  Jam / Waktu Acara
                </span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-brand-accent flex-shrink-0" />
                  <span className="text-sm font-bold text-brand-text-primary">
                    {activeProject?.startTime || activeProject?.endTime
                      ? `${activeProject.startTime || '—'} s/d ${activeProject.endTime || 'Selesai'} WIB`
                      : 'Sesuai Rundown / Fleksibel'}
                  </span>
                </div>
              </div>

              {/* Venue & Specific Address */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 sm:col-span-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <MapPin className="w-4 h-4 text-brand-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block">
                        Nama Venue & Lokasi
                      </span>
                      <p className="text-sm font-bold text-brand-text-primary mt-0.5">
                        {activeProject?.location || 'Lokasi belum ditentukan'}
                      </p>
                      {activeProject?.address && (
                        <p className="text-xs text-brand-text-secondary mt-1 leading-relaxed">
                          {activeProject.address}
                        </p>
                      )}
                    </div>
                  </div>
                  {activeProject?.googleMapsLink && (
                    <a
                      href={activeProject.googleMapsLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-brand-accent hover:bg-blue-100 text-xs font-bold transition-all flex-shrink-0"
                    >
                      <span>Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Accommodation if filled */}
              {activeProject?.accommodation && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-1">
                    Akomodasi / Penginapan Tim
                  </span>
                  <p className="text-xs text-brand-text-primary font-medium leading-relaxed">
                    {activeProject.accommodation}
                  </p>
                </div>
              )}
            </div>

            {/* Special Notes & Requests */}
            {activeProject?.notes && (
              <div className="mt-3.5 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 text-xs">
                <span className="font-bold text-amber-900 block mb-1">Catatan Khusus / Permintaan Pengantin:</span>
                <p className="text-amber-800 leading-relaxed whitespace-pre-line">{activeProject.notes}</p>
              </div>
            )}
          </div>

          {/* 3. Package & Ordered Services (Complete Inclusions Preview) */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Layanan & Spesifikasi Paket
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('package')}
                className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Rincian Paket & Add-On</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Package details */}
            <div className="space-y-4 text-xs">
              {/* Package Name & Duration Banner */}
              <div className="p-3.5 rounded-xl bg-brand-accent/5 border border-brand-accent/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-accent block">
                    Paket Terpilih
                  </span>
                  <span className="text-sm sm:text-base font-black text-brand-text-primary">
                    {activeProject?.packageName || selectedPackage?.name || 'Paket Kustom'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(activeProject?.durationSelection || selectedPackage?.durationOptions?.[0]?.label) && (
                    <span className="px-2.5 py-1 rounded-full bg-white text-brand-accent text-xs font-bold border border-brand-accent/30 shadow-2xs">
                      Durasi: {activeProject?.durationSelection || selectedPackage?.durationOptions?.[0]?.label}
                    </span>
                  )}
                  {selectedPackage?.processingTime && (
                    <span className="px-2.5 py-1 rounded-full bg-white text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs">
                      Pengerjaan: {selectedPackage.processingTime}
                    </span>
                  )}
                </div>
              </div>

              {/* Crew Inclusions & Deliverables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Crew Inclusions */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-2">
                    Kru Dokumentasi yang Disertakan
                  </span>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-brand-text-primary">
                      <UserCheck className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                      <span>Fotografer: <strong>{selectedPackage?.photographers || '1 Fotografer'}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-brand-text-primary">
                      <UserCheck className="w-3.5 h-3.5 text-brand-accent flex-shrink-0" />
                      <span>Videografer: <strong>{selectedPackage?.videographers || '1 Videografer'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Physical Deliverables */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-2">
                    Item Cetak / Fisik
                  </span>
                  {selectedPackage?.physicalItems && selectedPackage.physicalItems.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedPackage.physicalItems.map((item, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                        >
                          {item.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic">Hanya file digital / tanpa album fisik</p>
                  )}
                </div>
              </div>

              {/* Digital Inclusions */}
              {selectedPackage?.digitalItems && selectedPackage.digitalItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-2">
                    Output File Digital
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPackage.digitalItems.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs"
                      >
                        <FileCheck className="w-3 h-3 text-emerald-600" />
                        <span>{item}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Add-Ons if any */}
              {activeProject?.addOns && activeProject.addOns.length > 0 && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-secondary block mb-2">
                    Add-On Tambahan yang Dipesan
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.addOns.map((addon, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-semibold text-brand-text-primary shadow-2xs"
                      >
                        <span>{addon.name}</span>
                        <span className="text-emerald-600 font-bold">{formatCurrency(addon.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right Col: Operational Sidebar & Tasks ───────────────────────── */}
        <div className="space-y-6">
          {/* 1. Operational Progress & Deliverables */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FolderKanbanIcon className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Progres Operasional
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('tasks')}
                className="text-xs font-semibold text-brand-accent hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-brand-text-primary">Status: {progress.currentStatus}</span>
                <span className="font-bold text-brand-accent">{progress.percent}% Selesai</span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-brand-accent h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <p className="text-[11px] text-brand-text-secondary">
                {progress.completedSubStatuses} dari {progress.totalSubStatuses} tahapan kerja selesai.
              </p>

              {/* Final Drive Link Section */}
              {activeProject?.finalDriveLink ? (
                <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      File Jadi Tersedia
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(activeProject.finalDriveLink || '')}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>
                  <a
                    href={activeProject.finalDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <span>Buka Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-brand-text-secondary">
                  Link Google Drive file jadi belum diisi.
                </div>
              )}
            </div>
          </div>

          {/* 2. Assigned Crew / Team */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UsersIcon className="w-4 h-4 text-brand-accent" />
                <h3 className="text-sm font-bold text-brand-text-primary">
                  Tim & Kru Bertugas
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('team')}
                className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
              >
                Kelola Tim
              </button>
            </div>

            {activeProject?.team && activeProject.team.length > 0 ? (
              <div className="space-y-2">
                {activeProject.team.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-brand-accent/10 text-brand-accent flex items-center justify-center font-bold text-[11px] flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-text-primary truncate">{member.name}</p>
                        <p className="text-[10px] text-brand-text-secondary">{member.role}</p>
                      </div>
                    </div>
                    {member.subJob && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 flex-shrink-0">
                        {member.subJob}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-brand-text-secondary space-y-2">
                <p>Belum ada kru yang ditugaskan.</p>
                <button
                  type="button"
                  onClick={() => onNavigateTab('team')}
                  className="py-1.5 px-3 rounded-lg bg-brand-accent text-white text-xs font-bold hover:bg-brand-accent-hover transition-colors cursor-pointer"
                >
                  + Tugaskan Tim
                </button>
              </div>
            )}
          </div>

          {/* 3. Upcoming Meeting Box */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-brand-accent" />
              Agenda / Meeting Terdekat
            </h3>

            {nextMeeting ? (
              <div className="p-3.5 rounded-xl bg-brand-accent/5 border border-brand-accent/20">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-accent block mb-1">
                  {nextMeeting.metadata.kind || 'Meeting'}
                </span>
                <h4 className="text-sm font-bold text-brand-text-primary mb-1">{nextMeeting.event.title}</h4>
                <div className="text-xs text-brand-text-secondary space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {new Date(nextMeeting.event.date || nextMeeting.event.startAt.split('T')[0]).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      {nextMeeting.event.startAt.includes('T') ? `pukul ${nextMeeting.event.startAt.split('T')[1].substring(0, 5)}` : ''}
                    </span>
                  </div>
                  {(nextMeeting.metadata.location || nextMeeting.event.location) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{nextMeeting.metadata.location || nextMeeting.event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-brand-text-secondary">
                Belum ada jadwal meeting terdekat.
              </div>
            )}

            <button
              type="button"
              onClick={() => onNavigateTab('schedule')}
              className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-brand-text-primary text-xs font-bold transition-all text-center cursor-pointer"
            >
              + Tambah Jadwal Meeting
            </button>
          </div>

          {/* 4. Recent Payments Mini List */}
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                Riwayat Pembayaran
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('payment')}
                className="text-xs font-semibold text-brand-accent hover:underline cursor-pointer"
              >
                Semua
              </button>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-2">
                {recentTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs"
                  >
                    <div>
                      <p className="font-bold text-brand-text-primary">{tx.description || 'Pembayaran'}</p>
                      <p className="text-[10px] text-brand-text-secondary">{tx.date}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        tx.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-brand-text-secondary text-center py-4">Belum ada riwayat pembayaran.</p>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => onNavigateTab('payment')}
                className="flex-1 py-2 px-3 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all text-center cursor-pointer"
              >
                Catat Pembayaran
              </button>
              {activeProject && (
                <button
                  type="button"
                  onClick={() => onViewInvoice(activeProject)}
                  className="py-2 px-3 rounded-xl border border-brand-border hover:bg-slate-50 text-brand-text-primary text-xs font-bold transition-all inline-flex items-center gap-1 cursor-pointer"
                >
                  <FileTextIcon className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeddingOverview;
