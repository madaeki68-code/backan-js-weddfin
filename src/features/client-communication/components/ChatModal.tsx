import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../../shared/ui/Modal';
import { Project, Client, Profile } from '../../../types';
import { SendIcon, WhatsappIcon } from '../../../constants';
import { normalizeWhatsAppNumber } from '../utils/phone';
import { buildWhatsAppLink, openWhatsAppChat } from '../utils/whatsapp';
import { useWhatsAppTemplates } from '../hooks/useWhatsAppTemplates';
import { logClientInteraction } from '../services/clientCommunicationService';

export interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  client: Client;
  onSendMessage: (projectId: string, messageText: string) => void;
  userProfile?: Profile;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  onClose,
  project,
  client,
  onSendMessage,
  userProfile,
}) => {
  const { templates, processTemplate } = useWhatsAppTemplates(userProfile, {
    client,
    project,
    profile: userProfile,
  });

  const [newMessage, setNewMessage] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [project.chatHistory, isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(project.id, newMessage.trim());
      // Log to client interaction history
      logClientInteraction({
        clientId: client.id,
        projectId: project.id,
        clientName: client.name,
        channel: 'whatsapp',
        type: 'chat',
        message: newMessage.trim(),
        recipientPhone: normalizeWhatsAppNumber(client.whatsapp || client.phone),
      });
      setNewMessage('');
    }
  };

  const handleSelectTemplate = (templateStr: string) => {
    const processed = processTemplate(templateStr);
    setNewMessage(processed);
  };

  const handleShareToWhatsApp = () => {
    const rawPhone = client.whatsapp || client.phone;
    if (!rawPhone) {
      alert('Nomor telepon pengantin tidak tersedia.');
      return;
    }
    if (!newMessage.trim()) {
      alert('Tulis pesan terlebih dahulu atau pilih dari template.');
      return;
    }

    const cleanPhone = normalizeWhatsAppNumber(rawPhone);
    const sent = openWhatsAppChat(cleanPhone, newMessage.trim());
    if (sent) {
      logClientInteraction({
        clientId: client.id,
        projectId: project.id,
        clientName: client.name,
        channel: 'whatsapp',
        type: 'chat',
        message: newMessage.trim(),
        recipientPhone: cleanPhone,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Komunikasi dengan ${client.name}`}
      size="lg"
    >
      <div className="flex flex-col h-full">
        <p className="text-xs text-brand-text-secondary mb-3">
          Acara: <strong className="text-brand-text-primary">{project.projectName}</strong>
        </p>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto space-y-3 bg-brand-bg/60 rounded-xl mb-4 max-h-64 min-h-36">
          {(project.chatHistory || []).map(msg => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${
                msg.sender === 'vendor' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'client' && (
                <div className="w-7 h-7 rounded-full bg-brand-accent/20 flex items-center justify-center font-bold text-brand-accent text-xs flex-shrink-0">
                  {client.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                </div>
              )}
              <div
                className={`max-w-[85%] p-3 rounded-2xl ${
                  msg.sender === 'vendor'
                    ? 'bg-brand-accent text-white rounded-br-none shadow-2xs'
                    : 'bg-white border border-brand-border text-brand-text-primary rounded-bl-none shadow-2xs'
                }`}
              >
                <p className="text-xs whitespace-pre-wrap leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 border border-brand-border flex-shrink-0 bg-white rounded-xl shadow-xs">
          <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {templates.slice(0, 6).map(template => (
              <button
                key={template.id}
                type="button"
                onClick={() => handleSelectTemplate(template.template)}
                className="button-secondary !min-h-0 !h-auto flex-shrink-0 !text-[11px] !px-2.5 !py-1 whitespace-nowrap rounded-lg"
              >
                {template.title}
              </button>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="space-y-2">
            <textarea
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              placeholder="Ketik pesan..."
              className="w-full rounded-lg border border-brand-border bg-brand-surface p-2.5 text-xs text-brand-text-primary outline-none focus:border-brand-accent transition-all"
              rows={3}
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="button-primary rounded-lg flex-grow flex items-center justify-center gap-2 text-xs"
                title="Kirim Catatan Pesan"
              >
                <SendIcon className="w-3.5 h-3.5" /> Kirim Pesan
              </button>
              <button
                type="button"
                onClick={handleShareToWhatsApp}
                className="button-secondary aspect-square flex items-center justify-center !border-emerald-500/30 !text-emerald-600 hover:!bg-emerald-50 rounded-lg p-2 cursor-pointer"
                title="Kirim langsung ke WhatsApp"
              >
                <WhatsappIcon className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default ChatModal;
