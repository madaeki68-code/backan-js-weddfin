import { useState, useEffect, useCallback } from 'react';
import {
  Client,
  Project,
  NavigationAction,
  StatModalType,
  QrModalContent,
  SharePreviewContent,
} from '../types';
import { DocumentToView } from './useClientDocumentActions';
import { toPublicNameSlug } from '../../../utils/publicRouting';

interface UseClientModalsParams {
  clients: Client[];
  projects: Project[];
  initialAction: NavigationAction | null;
  setInitialAction: (action: NavigationAction | null) => void;
  onOpenEditForm: (mode: 'add' | 'edit', client?: Client, project?: Project) => void;
}

export function useClientModals({
  clients,
  projects,
  initialAction,
  setInitialAction,
  onOpenEditForm,
}: UseClientModalsParams) {
  const [activeStatModal, setActiveStatModal] = useState<StatModalType>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [clientForDetail, setClientForDetail] = useState<Client | null>(null);
  const [billingChatModal, setBillingChatModal] = useState<Client | null>(null);
  const [documentToView, setDocumentToView] = useState<DocumentToView | null>(null);
  const [qrModalContent, setQrModalContent] = useState<QrModalContent | null>(null);
  const [sharePreview, setSharePreview] = useState<SharePreviewContent | null>(null);
  const [showPdfPreviewModal, setShowPdfPreviewModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Handle incoming deep navigation actions
  useEffect(() => {
    if (initialAction && initialAction.type === 'VIEW_CLIENT_DETAILS' && initialAction.id) {
      const clientToView = clients.find(c => c.id === initialAction.id);
      if (clientToView) {
        setClientForDetail(clientToView);
        setIsDetailModalOpen(true);
      }
      setInitialAction(null);
    } else if (initialAction && initialAction.type === 'EDIT_CLIENT' && initialAction.id) {
      const clientToEdit = clients.find(c => c.id === initialAction.id);
      if (clientToEdit) {
        const clientProj =
          projects.find(p => p.clientId === clientToEdit.id) || (clientToEdit as any).mostRecentProject;
        onOpenEditForm('edit', clientToEdit, clientProj);
      }
      setInitialAction(null);
    }
  }, [initialAction, clients, projects, setInitialAction, onOpenEditForm]);

  const openClientDetail = useCallback((client: Client) => {
    setClientForDetail(client);
    setIsDetailModalOpen(true);
  }, []);

  const closeClientDetail = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  const openQrModal = useCallback((client: Client) => {
    const path = window.location.pathname.replace(/index\.html$/, '');
    const url = `${window.location.origin}${path}#/portal/${toPublicNameSlug(client.name)}`;
    setQrModalContent({
      title: `Portal QR Code untuk ${client.name}`,
      url,
      clientName: client.name,
      clientPhone: client.whatsapp || client.phone,
    });
  }, []);

  const closeQrModal = useCallback(() => {
    setQrModalContent(null);
  }, []);

  return {
    activeStatModal,
    setActiveStatModal,
    isDetailModalOpen,
    setIsDetailModalOpen,
    clientForDetail,
    setClientForDetail,
    openClientDetail,
    closeClientDetail,
    billingChatModal,
    setBillingChatModal,
    documentToView,
    setDocumentToView,
    qrModalContent,
    setQrModalContent,
    openQrModal,
    closeQrModal,
    sharePreview,
    setSharePreview,
    showPdfPreviewModal,
    setShowPdfPreviewModal,
    isExporting,
    setIsExporting,
  };
}

export default useClientModals;
