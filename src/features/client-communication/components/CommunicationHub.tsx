import React, { useState } from 'react';
import { Client, Project, Profile } from '../../../types';
import { useClientCommunication } from '../hooks/useClientCommunication';
import { ClientCommunicationHistoryList } from './ClientCommunicationHistoryList';
import { WhatsAppChatButton } from './WhatsAppChatButton';
import { TEMPLATE_CATEGORY_LABELS } from '../constants';
import {
  MessageSquare,
  History,
  Copy,
  Check,
  Send,
  Sparkles,
  Phone,
  Mail,
  Edit3,
} from 'lucide-react';
import { WhatsappIcon } from '../../../constants';

export interface CommunicationHubProps {
  client: Client;
  projects: Project[];
  onSendMessage?: (message: string, channel: 'whatsapp' | 'email' | 'sms') => void;
  showNotification: (message: string) => void;
  profile: Profile;
}

export const CommunicationHub: React.FC<CommunicationHubProps> = ({
  client,
  projects,
  onSendMessage,
  showNotification,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'composer' | 'history'>('templates');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    const clientProjects = projects.filter(p => p.clientId === client.id);
    return clientProjects[0]?.id || '';
  });
  const [copied, setCopied] = useState<boolean>(false);

  const clientProjects = projects.filter(p => p.clientId === client.id);
  const activeProject = clientProjects.find(p => p.id === selectedProjectId) || clientProjects[0] || null;

  const comm = useClientCommunication({
    client,
    project: activeProject,
    profile,
    onNotification: showNotification,
  });

  const handleCopy = async () => {
    await comm.copyMessage();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!comm.activeMessage.trim()) {
      showNotification('Pesan tidak boleh kosong.');
      return;
    }

    const sent = comm.sendWhatsApp(comm.activeMessage, {
      type: 'chat',
    });

    if (sent) {
      onSendMessage?.(comm.activeMessage, 'whatsapp');
    }
  };

  const handleSendEmail = () => {
    if (!comm.activeMessage.trim()) {
      showNotification('Pesan tidak boleh kosong.');
      return;
    }
    if (!client.email) {
      showNotification('Email pengantin belum tersedia.');
      return;
    }

    if (typeof window !== 'undefined') {
      const subject = encodeURIComponent(`Informasi Acara - ${profile.companyName || profile.fullName || 'Vendor'}`);
      const body = encodeURIComponent(comm.activeMessage);
      window.location.href = `mailto:${client.email}?subject=${subject}&body=${body}`;
      onSendMessage?.(comm.activeMessage, 'email');
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Client Header Bar ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-brand-border shadow-2xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brand-text-secondary">
            Pusat Komunikasi Klien
          </span>
          <h3 className="text-base font-bold text-brand-text-primary">
            {client.name}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-brand-text-secondary">
            <span>WhatsApp: <strong className="text-brand-text-primary">{comm.formattedPhone}</strong></span>
            {client.email && <span>Email: <strong className="text-brand-text-primary">{client.email}</strong></span>}
          </div>
        </div>

        {clientProjects.length > 1 && (
          <div className="w-full sm:w-auto">
            <label className="block text-[10px] font-bold text-brand-text-secondary uppercase mb-1">
              Pilih Acara Terkait:
            </label>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="w-full sm:w-56 px-3 py-1.5 rounded-xl border border-brand-border bg-brand-surface text-xs font-semibold"
            >
              {clientProjects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.projectName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Navigation Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-brand-border">
        <button
          type="button"
          onClick={() => setActiveTab('templates')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'templates'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Template WhatsApp
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('composer')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'composer'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <Edit3 className="w-3.5 h-3.5" />
          Tulis Pesan Bebas
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-brand-accent text-brand-accent'
              : 'border-transparent text-brand-text-secondary hover:text-brand-text-primary'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          Riwayat Komunikasi ({comm.history.length})
        </button>
      </div>

      {/* ── Tab Content ──────────────────────────────────────────────── */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {/* Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'lead_initial', 'lead_followup', 'payment_reminder', 'event_reminder', 'progress_update', 'confirmation', 'custom'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => comm.setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  comm.selectedCategory === cat
                    ? 'bg-brand-accent text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat === 'all' ? 'Semua Kategori' : TEMPLATE_CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>

          {/* Template Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
            {comm.filteredTemplates.map(tmpl => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => comm.selectTemplate(tmpl)}
                className="p-3 text-left rounded-xl bg-white hover:bg-slate-50 border border-brand-border/70 shadow-2xs hover:border-brand-accent/40 transition-all group"
              >
                <div className="text-xs font-bold text-brand-text-primary group-hover:text-brand-accent transition-colors">
                  {tmpl.title}
                </div>
                {tmpl.description && (
                  <div className="text-[11px] text-brand-text-secondary line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Message Preview & Editor */}
          <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-brand-text-primary">
                Preview Pesan (Dapat Diedit):
              </label>
              <span className="text-[11px] text-brand-text-secondary">
                Terkoneksi ke data acara & rekening vendor
              </span>
            </div>

            <textarea
              value={comm.activeMessage}
              onChange={e => comm.setActiveMessage(e.target.value)}
              rows={9}
              className="w-full p-3.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text-primary text-xs font-mono leading-relaxed focus:border-brand-accent focus:outline-none transition-all resize-y shadow-2xs"
              placeholder="Pilih template di atas atau tulis pesan langsung di sini..."
            />

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-brand-border">
              <button
                type="button"
                onClick={handleCopy}
                className="button-secondary inline-flex items-center gap-1.5 text-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
              </button>

              <div className="flex items-center gap-2">
                {client.email && (
                  <button
                    type="button"
                    onClick={handleSendEmail}
                    className="button-secondary inline-flex items-center gap-1.5 text-xs"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Kirim Email</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  disabled={!comm.isPhoneValid}
                  className="button-primary inline-flex items-center gap-1.5 text-xs !bg-emerald-600 hover:!bg-emerald-500 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <WhatsappIcon className="w-4 h-4" />
                  <span>Kirim via WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'composer' && (
        <div className="p-4 rounded-2xl bg-white border border-brand-border shadow-xs space-y-3">
          <label className="text-xs font-bold text-brand-text-primary">
            Tulis Pesan Bebas untuk {client.name}:
          </label>
          <textarea
            value={comm.activeMessage}
            onChange={e => comm.setActiveMessage(e.target.value)}
            rows={10}
            className="w-full p-3.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text-primary text-xs font-mono leading-relaxed focus:border-brand-accent focus:outline-none transition-all resize-y shadow-2xs"
            placeholder="Tulis pesan personal..."
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-brand-border">
            <button
              type="button"
              onClick={handleCopy}
              className="button-secondary inline-flex items-center gap-1.5 text-xs"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Salin</span>
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              disabled={!comm.isPhoneValid}
              className="button-primary inline-flex items-center gap-1.5 text-xs !bg-emerald-600 hover:!bg-emerald-500 disabled:opacity-50 cursor-pointer"
            >
              <WhatsappIcon className="w-4 h-4" />
              <span>Kirim via WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <ClientCommunicationHistoryList
          logs={comm.history}
          clientName={client.name}
          onDeleteLog={comm.removeLog}
          onClearAll={comm.clearHistory}
          isLoading={comm.isLoadingHistory}
        />
      )}
    </div>
  );
};

export default CommunicationHub;
