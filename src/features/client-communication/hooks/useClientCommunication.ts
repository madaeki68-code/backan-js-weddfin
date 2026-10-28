import { useState, useMemo, useCallback } from 'react';
import { Client, Project, Lead, Profile } from '../../../types';
import {
  CommunicationTemplate,
  ClientInteractionLog,
  CommunicationContextData,
} from '../types';
import {
  normalizeWhatsAppNumber,
  formatDisplayPhoneNumber,
  isValidWhatsAppNumber,
} from '../utils/phone';
import { buildWhatsAppLink, openWhatsAppChat } from '../utils/whatsapp';
import { useCommunicationHistory } from './useCommunicationHistory';
import { useWhatsAppTemplates } from './useWhatsAppTemplates';

export interface UseClientCommunicationOptions {
  client?: Client | null;
  project?: Project | null;
  lead?: Lead | null;
  profile?: Profile | null;
  onNotification?: (message: string) => void;
}

export function useClientCommunication({
  client,
  project,
  lead,
  profile,
  onNotification,
}: UseClientCommunicationOptions) {
  const [activeMessage, setActiveMessage] = useState<string>('');

  const clientId = client?.id || lead?.id || '';
  const clientName = client?.name || lead?.name || 'Klien';
  const rawPhone = client?.whatsapp || client?.phone || lead?.whatsapp;

  const normalizedPhone = useMemo(() => normalizeWhatsAppNumber(rawPhone), [rawPhone]);
  const formattedPhone = useMemo(() => formatDisplayPhoneNumber(rawPhone), [rawPhone]);
  const isPhoneValid = useMemo(() => isValidWhatsAppNumber(rawPhone), [rawPhone]);

  const contextData: CommunicationContextData = useMemo(
    () => ({
      client,
      project,
      lead,
      profile,
    }),
    [client, project, lead, profile]
  );

  // History hook
  const {
    history,
    isLoading: isLoadingHistory,
    addLog,
    removeLog,
    clearAll: clearHistory,
    reload: reloadHistory,
  } = useCommunicationHistory(clientId);

  // Templates hook
  const {
    templates,
    filteredTemplates,
    isLoading: isLoadingTemplates,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    processTemplate,
  } = useWhatsAppTemplates(profile, contextData);

  // Pilih template & set ke activeMessage
  const selectTemplate = useCallback(
    (template: CommunicationTemplate) => {
      const processed = processTemplate(template.template);
      setActiveMessage(processed);
      return processed;
    },
    [processTemplate]
  );

  // Kirim pesan WhatsApp & otomatis rekam log interaksi
  const sendWhatsApp = useCallback(
    (
      messageText?: string,
      options?: {
        target?: '_blank' | '_self';
        type?: ClientInteractionLog['type'];
        metadata?: Record<string, string | number | boolean>;
      }
    ): boolean => {
      const textToSend = messageText !== undefined ? messageText : activeMessage;
      if (!textToSend.trim()) {
        onNotification?.('Pesan tidak boleh kosong.');
        return false;
      }

      if (!isPhoneValid) {
        onNotification?.('Nomor WhatsApp klien tidak valid atau belum diisi.');
        return false;
      }

      const success = openWhatsAppChat(normalizedPhone, textToSend, options?.target || '_blank');
      if (success) {
        // Rekam interaksi ke history klien
        if (clientId) {
          addLog({
            clientId,
            leadId: lead?.id,
            projectId: project?.id,
            clientName,
            channel: 'whatsapp',
            type: options?.type || 'chat',
            message: textToSend,
            recipientPhone: normalizedPhone,
            metadata: options?.metadata,
          });
        }
        onNotification?.('Membuka WhatsApp...');
      } else {
        onNotification?.('Gagal membuka WhatsApp. Mohon periksa pemblokir pop-up browser.');
      }

      return success;
    },
    [
      activeMessage,
      isPhoneValid,
      normalizedPhone,
      clientId,
      clientName,
      lead?.id,
      project?.id,
      addLog,
      onNotification,
    ]
  );

  // Salin pesan ke clipboard
  const copyMessage = useCallback(
    async (messageText?: string) => {
      const textToCopy = messageText !== undefined ? messageText : activeMessage;
      if (!textToCopy) return;

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(textToCopy);
          onNotification?.('Pesan berhasil disalin ke clipboard.');
        }
      } catch (err) {
        console.warn('Failed to copy message:', err);
        onNotification?.('Gagal menyalin pesan.');
      }
    },
    [activeMessage, onNotification]
  );

  return {
    client,
    project,
    lead,
    profile,
    clientId,
    clientName,
    rawPhone,
    normalizedPhone,
    formattedPhone,
    isPhoneValid,
    activeMessage,
    setActiveMessage,
    // Templates
    templates,
    filteredTemplates,
    isLoadingTemplates,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    selectTemplate,
    processTemplate,
    // History
    history,
    isLoadingHistory,
    removeLog,
    clearHistory,
    reloadHistory,
    // Actions
    sendWhatsApp,
    copyMessage,
  };
}
