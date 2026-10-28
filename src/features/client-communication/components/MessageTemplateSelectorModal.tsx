import React, { useState, useEffect } from 'react';
import Modal from '../../../shared/ui/Modal';
import { Client, Project, Lead, Profile } from '../../../types';
import {
  CommunicationTemplate,
  MessageTemplateCategory,
} from '../types';
import { TEMPLATE_CATEGORY_LABELS } from '../constants';
import { useClientCommunication } from '../hooks/useClientCommunication';
import { WhatsappIcon } from '../../../constants';
import {
  Copy,
  Send,
  Sparkles,
  Search,
  Check,
  Edit3,
} from 'lucide-react';

export interface MessageTemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  project?: Project | null;
  lead?: Lead | null;
  profile?: Profile | null;
  initialTemplateId?: string;
  showNotification?: (message: string) => void;
  onMessageSent?: (messageText: string) => void;
}

export const MessageTemplateSelectorModal: React.FC<MessageTemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  client,
  project,
  lead,
  profile,
  initialTemplateId,
  showNotification = () => undefined,
  onMessageSent,
}) => {
  const comm = useClientCommunication({
    client,
    project,
    lead,
    profile,
    onNotification: showNotification,
  });

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(initialTemplateId || '');
  const [copied, setCopied] = useState<boolean>(false);

  // Set default initial template
  useEffect(() => {
    if (isOpen && comm.templates.length > 0) {
      const target = initialTemplateId
        ? comm.templates.find(t => t.id === initialTemplateId)
        : comm.templates[0];
      if (target) {
        setSelectedTemplateId(target.id);
        comm.selectTemplate(target);
      }
    }
  }, [isOpen, initialTemplateId, comm.templates]);

  const handleSelectTemplate = (template: CommunicationTemplate) => {
    setSelectedTemplateId(template.id);
    comm.selectTemplate(template);
  };

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
      onMessageSent?.(comm.activeMessage);
      onClose();
    }
  };

  if (!isOpen) return null;

  const categories: (MessageTemplateCategory | 'all')[] = [
    'all',
    'lead_initial',
    'lead_followup',
    'payment_reminder',
    'event_reminder',
    'progress_update',
    'confirmation',
    'custom',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Kirim Pesan ke ${comm.clientName}`}
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="text-xs text-brand-text-secondary">
            Penerima: <span className="font-bold text-brand-text-primary">{comm.formattedPhone}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="button-secondary inline-flex items-center gap-1.5 text-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Tersalin' : 'Salin Pesan'}</span>
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
      }
    >
      <div className="space-y-4">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
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
              {cat === 'all' ? 'Semua Template' : TEMPLATE_CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        {/* Template Selectors */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
          {comm.filteredTemplates.map(tmpl => (
            <button
              key={tmpl.id}
              type="button"
              onClick={() => handleSelectTemplate(tmpl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedTemplateId === tmpl.id
                  ? 'bg-white text-brand-accent font-bold shadow-xs border border-brand-accent/30'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {tmpl.title}
            </button>
          ))}
        </div>

        {/* Preview & Edit Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-brand-text-secondary flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5" />
              Tinjau & Edit Pesan Sebelum Dikirim:
            </label>
            <span className="text-[11px] text-brand-text-secondary">
              Variabel otomatis disesuaikan dengan data riil pengantin
            </span>
          </div>

          <textarea
            value={comm.activeMessage}
            onChange={e => comm.setActiveMessage(e.target.value)}
            rows={10}
            className="w-full p-3.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text-primary text-xs font-mono leading-relaxed focus:border-brand-accent focus:outline-none transition-all resize-y shadow-2xs"
            placeholder="Ketik atau pilih template pesan..."
          />
        </div>

        {!comm.isPhoneValid && (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
            Nomor telepon pengantin belum diisi atau tidak valid ({comm.rawPhone || 'kosong'}). Pastikan pengantin memiliki nomor WhatsApp yang benar agar pesan dapat dikirim langsung.
          </div>
        )}
      </div>
    </Modal>
  );
};
