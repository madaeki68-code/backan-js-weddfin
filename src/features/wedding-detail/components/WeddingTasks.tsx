import React, { useState } from 'react';
import { Project, Profile, Client } from '../../../types';
import { WeddingProgressSummary } from '../types/weddingDetail.types';
import {
  FolderKanban,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Save,
  Link as LinkIcon,
  FileEdit,
} from 'lucide-react';
import { generateWhatsAppLink } from '../../../utils/whatsapp';

interface WeddingTasksProps {
  client: Client;
  activeProject: Project | null;
  profile: Profile;
  progress: WeddingProgressSummary;
  onUpdateProjectStatus: (status: string) => Promise<void>;
  onToggleSubStatus: (subStatusName: string, active: boolean) => Promise<void>;
  onSaveFinalDriveLink: (link: string) => Promise<void>;
  onUpdateNotes: (notes: string) => Promise<void>;
}

export const WeddingTasks: React.FC<WeddingTasksProps> = ({
  client,
  activeProject,
  profile,
  progress,
  onUpdateProjectStatus,
  onToggleSubStatus,
  onSaveFinalDriveLink,
  onUpdateNotes,
}) => {
  const [driveLink, setDriveLink] = useState(activeProject?.finalDriveLink || '');
  const [isSavingLink, setIsSavingLink] = useState(false);

  const [notes, setNotes] = useState(activeProject?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);

  if (!activeProject) {
    return (
      <div className="py-12 text-center text-xs text-brand-text-secondary bg-white rounded-2xl border border-brand-border">
        Pilih acara pernikahan untuk mengelola tugas dan tahapan operasional.
      </div>
    );
  }

  const allSubStatuses =
    activeProject.customSubStatuses ||
    profile.projectStatusConfig?.find(s => s.name === activeProject.status)?.subStatuses ||
    [];

  const activeSubStatusesList = activeProject.activeSubStatuses || [];

  const handleSaveDriveLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingLink(true);
    try {
      await onSaveFinalDriveLink(driveLink.trim());
    } finally {
      setIsSavingLink(false);
    }
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingNotes(true);
    try {
      await onUpdateNotes(notes.trim());
    } finally {
      setIsSavingNotes(false);
    }
  };

  // WhatsApp share template for final drive link
  const phone = client.whatsapp || client.phone;
  const finalLinkMessage = `Halo Kak ${client.name},\n\nTerima kasih telah mempercayakan momen bahagia acara ${activeProject.projectName} kepada ${profile.companyName || 'Attera Visual'}. ✨\n\nBerikut tautan Google Drive untuk mengunduh hasil foto dan video dokumentasi acara:\n${driveLink}\n\nSemoga hasilnya berkesan dan disukai ya Kak! Jika ada kendala mengunduh, jangan ragu hubungi kami. 🙏🏻😊`;
  const whatsappDriveUrl = phone && driveLink ? generateWhatsAppLink(phone, finalLinkMessage) : null;

  return (
    <div className="space-y-6">
      {/* ── Status Utama & Progress Bar ─────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-accent block mb-1">
              Status Operasional Acara
            </span>
            <div className="flex items-center gap-3">
              <select
                value={activeProject.status}
                onChange={e => onUpdateProjectStatus(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-brand-text-primary focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent outline-none cursor-pointer"
              >
                {(profile.projectStatusConfig || []).map(s => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs font-bold text-brand-text-secondary block">
              Progres Penyelesaian
            </span>
            <span className="text-xl sm:text-2xl font-black text-brand-accent">
              {progress.percent}%
            </span>
            <span className="text-[11px] text-brand-text-secondary block">
              ({progress.completedSubStatuses} dari {progress.totalSubStatuses} tahapan selesai)
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-brand-accent h-full rounded-full transition-all duration-500"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      </div>

      {/* ── Sub-Status Checklist ────────────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Checklist Tahapan & Tugas Wedding
          </h3>
          <span className="text-xs text-brand-text-secondary">
            Klik checkbox untuk menandai selesai
          </span>
        </div>

        {allSubStatuses.length === 0 ? (
          <div className="py-8 text-center text-xs text-brand-text-secondary bg-slate-50 rounded-xl">
            Tidak ada tahapan khusus untuk status acara ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allSubStatuses.map(sub => {
              const isChecked = activeSubStatusesList.includes(sub.name);
              return (
                <label
                  key={sub.name}
                  className={`flex items-start gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
                      : 'bg-slate-50/50 border-slate-200/80 hover:bg-white hover:border-brand-accent/40 text-brand-text-primary'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={e => onToggleSubStatus(sub.name, e.target.checked)}
                    className="w-5 h-5 rounded-md border-slate-300 text-brand-accent focus:ring-brand-accent/30 mt-0.5 cursor-pointer"
                  />
                  <div className="min-w-0 flex-1 text-xs">
                    <span className={`font-bold block leading-snug ${isChecked ? 'line-through text-slate-500' : ''}`}>
                      {sub.name}
                    </span>
                    {sub.note && (
                      <span className="text-[11px] text-slate-500 block mt-0.5 leading-normal">
                        {sub.note}
                      </span>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Link File Jadi (Deliverables) ────────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <LinkIcon className="w-4 h-4 text-brand-accent" />
          Link Hasil Dokumentasi (Google Drive / Cloud)
        </h3>

        <form onSubmit={handleSaveDriveLink} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              placeholder="https://drive.google.com/drive/folders/..."
              value={driveLink}
              onChange={e => setDriveLink(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs"
            />
            <button
              type="submit"
              disabled={isSavingLink}
              className="px-4 py-2.5 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingLink ? 'Menyimpan...' : 'Simpan Link'}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {activeProject.finalDriveLink && (
              <a
                href={activeProject.finalDriveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Buka Tautan Drive</span>
              </a>
            )}

            {whatsappDriveUrl && (
              <a
                href={whatsappDriveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Kirim Link via WhatsApp</span>
              </a>
            )}
          </div>
        </form>
      </div>

      {/* ── Catatan Khusus & Request Pengantin ────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-brand-border shadow-xs">
        <h3 className="text-sm font-bold text-brand-text-primary flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
          <FileEdit className="w-4 h-4 text-brand-accent" />
          Catatan Khusus / Briefing Pengantin
        </h3>

        <form onSubmit={handleSaveNotes} className="space-y-3">
          <textarea
            rows={4}
            placeholder="Catatan mengenai moodboard, referensi foto/video, lagu favorit untuk video teaser, atau permintaan khusus keluarga..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-brand-border bg-brand-input text-brand-text-primary text-xs leading-relaxed resize-none"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingNotes}
              className="px-4 py-2 rounded-xl bg-brand-accent hover:bg-brand-accent-hover text-white text-xs font-bold transition-all disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingNotes ? 'Menyimpan...' : 'Simpan Catatan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WeddingTasks;
