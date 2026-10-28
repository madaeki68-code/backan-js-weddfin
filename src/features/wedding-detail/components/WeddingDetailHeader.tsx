import React, { useMemo } from 'react';
import { Client, Project, Profile, PaymentStatus } from '../../../types';
import { PencilIcon, Share2Icon, PhoneIcon } from '../../../constants';
import { MessageSquare, Calendar, MapPin, Sparkles, Instagram, Clock, X } from 'lucide-react';
import { generateWhatsAppLink } from '../../../utils/whatsapp';
import { WeddingFinancialSummary } from '../types/weddingDetail.types';

interface WeddingDetailHeaderProps {
  client: Client;
  activeProject: Project | null;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  profile: Profile;
  financial: WeddingFinancialSummary;
  onEditClient: (client: Client) => void;
  onSharePortal: (client: Client) => void;
  onClose?: () => void;
}

export const WeddingDetailHeader: React.FC<WeddingDetailHeaderProps> = ({
  client,
  activeProject,
  projects,
  activeProjectId,
  onSelectProject,
  profile,
  financial,
  onEditClient,
  onSharePortal,
  onClose,
}) => {
  const initials = client.name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  const phone = client.whatsapp || client.phone;
  const whatsappUrl = phone
    ? generateWhatsAppLink(
        phone,
        `Halo Kak ${client.name}, kami dari ${profile.companyName || 'Attera Visual'}. Semoga persiapan hari bahagianya lancar ya Kak!`
      )
    : null;

  const instagramHandle = client.instagram ? client.instagram.replace(/^@/, '').trim() : '';

  // Wedding countdown calculation
  const countdown = useMemo(() => {
    if (!activeProject?.date) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(activeProject.date);
    eventDate.setHours(0, 0, 0, 0);

    const diffMs = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return {
        label: 'Hari-H Hari Ini 🎉',
        badgeClass: 'bg-rose-500/25 text-rose-200 border-rose-500/40 ring-1 ring-rose-400/50',
      };
    } else if (diffDays > 0) {
      return {
        label: `H-${diffDays} Hari`,
        badgeClass:
          diffDays <= 7
            ? 'bg-amber-500/25 text-amber-200 border-amber-500/40 font-black'
            : 'bg-brand-accent/25 text-brand-accent-light border-brand-accent/40',
      };
    } else {
      return {
        label: `Selesai (H+${Math.abs(diffDays)})`,
        badgeClass: 'bg-slate-500/25 text-slate-300 border-slate-500/40',
      };
    }
  }, [activeProject?.date]);

  const paymentStatusBadgeColor = {
    [PaymentStatus.LUNAS]: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    [PaymentStatus.DP_TERBAYAR]: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    [PaymentStatus.BELUM_BAYAR]: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  }[financial.paymentStatus] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';

  const paymentStatusLabel = {
    [PaymentStatus.LUNAS]: 'LUNAS',
    [PaymentStatus.DP_TERBAYAR]: 'DP TERBAYAR',
    [PaymentStatus.BELUM_BAYAR]: 'BELUM BAYAR',
  }[financial.paymentStatus] || 'BELUM BAYAR';

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-4 shadow-xl bg-cover bg-center border border-white/10"
      style={
        profile.publicPageConfig?.backgroundImages?.clientDetail
          ? { backgroundImage: `url(${profile.publicPageConfig.backgroundImages.clientDetail})` }
          : undefined
      }
    >
      {/* Background Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/95 pointer-events-none" />

      {/* Decorative ambient lights */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-brand-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

      <div className="relative p-4 sm:p-6 text-white">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Left: Avatar + Names + Metadata */}
          <div className="flex items-center gap-3.5 sm:gap-5 min-w-0 flex-1">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 shadow-inner border border-white/20">
              {client.avatarUrl ? (
                <img
                  src={client.avatarUrl}
                  alt={client.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <span className="text-white font-black text-xl sm:text-2xl tracking-tight select-none">
                  {initials || 'WD'}
                </span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-accent-light px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15">
                  Detail Pengantin
                </span>
                {countdown && (
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${countdown.badgeClass}`}
                  >
                    <Clock className="w-3 h-3" />
                    {countdown.label}
                  </span>
                )}
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${paymentStatusBadgeColor}`}>
                  {paymentStatusLabel}
                </span>
                {activeProject?.status && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white/90 border border-white/15">
                    {activeProject.status}
                  </span>
                )}
              </div>

              {/* Client / Bride & Groom Name */}
              <h2 className="text-lg sm:text-2xl font-black text-white leading-tight truncate">
                {client.name}
              </h2>

              {/* Event metadata details */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-3.5 text-xs text-white/80 mt-1.5">
                {activeProject?.date && (
                  <span className="inline-flex items-center gap-1 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-brand-accent-light" />
                    {new Date(activeProject.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                )}
                {activeProject?.location && (
                  <span className="inline-flex items-center gap-1 truncate max-w-[220px] sm:max-w-xs font-medium">
                    <MapPin className="w-3.5 h-3.5 text-brand-accent-light flex-shrink-0" />
                    {activeProject.location}
                  </span>
                )}
                {activeProject?.packageName && (
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-accent-light">
                    <Sparkles className="w-3.5 h-3.5" />
                    {activeProject.packageName}
                  </span>
                )}
                {instagramHandle && (
                  <a
                    href={`https://instagram.com/${instagramHandle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors"
                    title={`Instagram: @${instagramHandle}`}
                  >
                    <Instagram className="w-3.5 h-3.5 text-pink-300" />
                    <span>@{instagramHandle}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="Chat WhatsApp"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/15 cursor-pointer"
                title="Hubungi Telepon"
              >
                <PhoneIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Telepon</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => onSharePortal(client)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              title="Bagikan Portal Pengantin"
            >
              <Share2Icon className="w-3.5 h-3.5" />
              <span>Portal</span>
            </button>

            <button
              type="button"
              onClick={() => onEditClient(client)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/20 cursor-pointer"
              title="Edit Data Pengantin"
            >
              <PencilIcon className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all border border-white/15 cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* If client has multiple projects/events, offer tab/switch */}
        {projects.length > 1 && (
          <div className="mt-4 pt-3 border-t border-white/15 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[11px] font-bold text-white/70 whitespace-nowrap">Pilih Acara:</span>
            {projects.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProject(p.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  p.id === activeProjectId
                    ? 'bg-brand-accent text-white shadow-sm'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {p.projectName}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeddingDetailHeader;
