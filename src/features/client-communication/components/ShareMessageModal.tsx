import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../../shared/ui/Modal';
import { WhatsappIcon } from '../../../constants';
import { normalizeWhatsAppNumber } from '../utils/phone';
import { buildWhatsAppLink } from '../utils/whatsapp';

export interface ShareMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  initialMessage: string;
  phone?: string | null;
  showNotification?: (message: string) => void;
}

export const ShareMessageModal: React.FC<ShareMessageModalProps> = ({
  isOpen,
  onClose,
  title,
  initialMessage,
  phone,
  showNotification,
}) => {
  const [message, setMessage] = useState<string>(initialMessage || '');

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage || '');
    }
  }, [isOpen, initialMessage]);

  const canNativeShare = useMemo(() => {
    return (
      typeof navigator !== 'undefined' &&
      'share' in navigator &&
      typeof navigator.share === 'function'
    );
  }, []);

  const notify = (text: string) => {
    if (showNotification) {
      showNotification(text);
    }
  };

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        notify('Pesan berhasil disalin.');
      }
    } catch {
      notify('Gagal menyalin pesan.');
    }
  };

  const handleNativeShare = async () => {
    try {
      if (canNativeShare) {
        await navigator.share({ text: message });
      }
    } catch {
      // User cancelled share
    }
  };

  const handleOpenWhatsApp = () => {
    if (!message.trim()) {
      notify('Pesan tidak boleh kosong.');
      return;
    }

    const cleanPhone = normalizeWhatsAppNumber(phone);
    const waUrl = buildWhatsAppLink(cleanPhone, message);
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
      footer={
        <div className="flex flex-wrap items-center justify-between w-full gap-2">
          <div className="text-xs text-brand-text-secondary">
            {phone ? `No. Tujuan: ${phone}` : 'Tanpa nomor spesifik'}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={handleCopy} className="button-secondary text-xs">
              Salin Pesan
            </button>
            {canNativeShare && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="button-secondary text-xs"
              >
                Bagikan
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="button-primary inline-flex items-center gap-2 text-xs !bg-emerald-600 hover:!bg-emerald-500 shadow-xs cursor-pointer"
            >
              <WhatsappIcon className="w-4 h-4" /> Kirim via WhatsApp
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <div className="input-group">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={12}
            className="w-full p-3.5 rounded-xl border border-brand-border bg-brand-surface text-brand-text-primary text-xs font-mono leading-relaxed focus:border-brand-accent focus:outline-none transition-all resize-y shadow-2xs"
          />
          <label className="text-xs font-bold text-brand-text-secondary">
            Preview Pesan (Dapat Diedit Sebelum Dikirim)
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default ShareMessageModal;
