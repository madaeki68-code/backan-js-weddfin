import React, { useState, useEffect } from 'react';
import { Client, Project, Profile } from '../../../types';
import { WhatsappIcon, DEFAULT_BILLING_TEMPLATES } from '../../../constants';
import { formatCurrency } from '../../../utils/currency';
import { normalizeWhatsAppNumber } from '../utils/phone';
import { openWhatsAppChat } from '../utils/whatsapp';
import { toPublicNameSlug } from '../../../utils/publicRouting';
import { logClientInteraction } from '../services/clientCommunicationService';

export interface BillingChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  projects: Project[];
  userProfile?: Profile | null;
  data?: Partial<Profile> | null;
  showNotification: (message: string) => void;
}

export const BillingChatModal: React.FC<BillingChatModalProps> = ({
  isOpen,
  onClose,
  client,
  projects,
  userProfile,
  data = userProfile,
  showNotification,
}) => {
  const [message, setMessage] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const billingTemplates = data?.billingTemplates || userProfile?.billingTemplates;
  const BILLING_CHAT_TEMPLATES =
    billingTemplates && billingTemplates.length > 0
      ? billingTemplates
      : DEFAULT_BILLING_TEMPLATES;

  useEffect(() => {
    if (!client) return;

    const projectsWithBalance = projects.filter(
      p => p.clientId === client.id && p.totalCost - p.amountPaid > 0
    );
    if (projectsWithBalance.length === 0) return;

    const totalDue = projectsWithBalance.reduce(
      (sum, p) => sum + (p.totalCost - p.amountPaid),
      0
    );

    const projectDetails = projectsWithBalance
      .map(
        p =>
          `- Acara: *${p.projectName}*\n  Sisa Pembayaran: ${formatCurrency(
            p.totalCost - p.amountPaid
          )}`
      )
      .join('\n');

    const path = typeof window !== 'undefined' ? window.location.pathname.replace(/index\.html$/, '') : '';
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const portalLink = `${origin}${path}#/portal/${toPublicNameSlug(client.name)}`;

    const template =
      BILLING_CHAT_TEMPLATES.find(t => t.id === selectedTemplateId)?.template ||
      BILLING_CHAT_TEMPLATES[0]?.template ||
      DEFAULT_BILLING_TEMPLATES[0]?.template ||
      '';

    const processedMessage = template
      .replace('{clientName}', client.name || '')
      .replace('{projectDetails}', projectDetails)
      .replace('{totalDue}', formatCurrency(totalDue))
      .replace('{portalLink}', portalLink)
      .replace('{bankAccount}', userProfile?.bankAccount || data?.bankAccount || 'Sesuai Rekening Resmi')
      .replace(/{companyName}/g, userProfile?.companyName || data?.companyName || 'Tim Kami');

    setMessage(processedMessage);
  }, [client, projects, userProfile, data, selectedTemplateId, BILLING_CHAT_TEMPLATES]);

  const handleShareToWhatsApp = () => {
    if (!client || (!client.phone && !client.whatsapp)) {
      showNotification('Nomor telepon pengantin tidak tersedia.');
      return;
    }
    if (!message.trim()) {
      showNotification('Pesan tidak boleh kosong.');
      return;
    }

    const cleanPhone = normalizeWhatsAppNumber(client.whatsapp || client.phone);
    const sent = openWhatsAppChat(cleanPhone, message);
    if (sent) {
      logClientInteraction({
        clientId: client.id,
        clientName: client.name,
        channel: 'whatsapp',
        type: 'payment_reminder',
        message,
        recipientPhone: cleanPhone,
      });
      showNotification('Membuka WhatsApp untuk mengirim pengingat...');
      onClose();
    } else {
      showNotification('Gagal membuka WhatsApp. Mohon periksa pemblokir pop-up browser.');
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-brand-surface border border-brand-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
        <div className="p-4 md:p-6 border-b border-brand-border flex justify-between items-center">
          <div>
            <h3 className="text-base md:text-lg font-bold text-brand-text-primary">
              Kirim Pengingat Pembayaran ke {client.name}
            </h3>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              WhatsApp: {normalizeWhatsAppNumber(client.whatsapp || client.phone) || 'Belum diisi'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-brand-text-secondary hover:text-brand-text-primary p-1 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-4 md:p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">
              Gunakan Template Pesan:
            </label>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {BILLING_CHAT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplateId(template.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    (selectedTemplateId || BILLING_CHAT_TEMPLATES[0]?.id) === template.id
                      ? 'bg-brand-accent text-white border-brand-accent shadow-xs'
                      : 'bg-white border-brand-border text-brand-text-primary hover:bg-slate-50'
                  }`}
                >
                  {template.title}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-brand-text-secondary">
              Pratinjau Pesan (Bisa diedit sebelum dikirim):
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={8}
              className="mt-1.5 w-full p-3 rounded-xl border border-brand-border bg-white text-brand-text-primary text-xs font-mono leading-relaxed focus:outline-none focus:border-brand-accent"
            />
          </div>
        </div>
        <div className="p-4 md:p-6 border-t border-brand-border flex justify-end gap-3 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleShareToWhatsApp}
            className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-xs inline-flex items-center gap-2 cursor-pointer"
          >
            <WhatsappIcon className="w-4 h-4" />
            Kirim ke WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default BillingChatModal;
