import { useState, useEffect, useCallback } from 'react';
import {
  Lead,
  LeadStatus,
  ContactChannel,
  Profile,
  ClientType,
  NavigationAction,
} from '../../../types';
import type {
  LeadModalMode,
  LeadFormData,
  ConvertLeadFormData,
} from '../types/leads.types';

export interface UseLeadModalsProps {
  leads: Lead[];
  userProfile: Profile;
  initialAction?: NavigationAction | null;
  setInitialAction?: React.Dispatch<React.SetStateAction<NavigationAction | null>>;
}

const defaultLeadFormData: LeadFormData = {
  name: '',
  contactChannel: ContactChannel.OTHER,
  location: '',
  address: '',
  whatsapp: '',
  notes: '',
  eventDate: '',
  date: new Date().toISOString().split('T')[0],
  status: LeadStatus.DISCUSSION,
};

export function useLeadModals({
  leads,
  userProfile,
  initialAction,
  setInitialAction,
}: UseLeadModalsProps) {
  // Form Modal (Add / Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<LeadModalMode>('add');
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [leadFormData, setLeadFormData] = useState<LeadFormData>(defaultLeadFormData);

  // Convert Modal
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState<Lead | null>(null);
  const [convertFormData, setConvertFormData] = useState<ConvertLeadFormData>({
    clientName: '',
    email: '',
    phone: '',
    whatsapp: '',
    instagram: '',
    clientType: ClientType.DIRECT,
    projectName: '',
    projectType: '',
    location: '',
    address: '',
    date: new Date().toISOString().split('T')[0],
    packageId: '',
    selectedAddOnIds: [],
    dp: '',
    dpDestinationCardId: '',
    notes: '',
    promoCodeId: '',
  });

  // Detail Modal
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);

  // Share Modal
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareType, setShareType] = useState<'package' | 'booking'>('package');
  const [selectedLeadForShare, setSelectedLeadForShare] = useState<Lead | null>(null);

  // Stats Modal
  const [statsModal, setStatsModal] = useState<{
    isOpen: boolean;
    title: string;
    leads: Lead[];
  }>({
    isOpen: false,
    title: '',
    leads: [],
  });

  // Open Form Modal: Add
  const openAddModal = useCallback(() => {
    setFormModalMode('add');
    setSelectedLeadForEdit(null);
    setLeadFormData({
      ...defaultLeadFormData,
      date: new Date().toISOString().split('T')[0],
    });
    setIsFormModalOpen(true);
  }, []);

  // Open Form Modal: Edit
  const openEditModal = useCallback((lead: Lead) => {
    setFormModalMode('edit');
    setSelectedLeadForEdit(lead);
    setLeadFormData({
      name: lead.name,
      contactChannel: lead.contactChannel,
      location: lead.location || '',
      address: lead.address || '',
      whatsapp: lead.whatsapp || '',
      notes: lead.notes || '',
      eventDate: lead.eventDate || '',
      date: lead.date,
      status: lead.status,
    });
    setIsFormModalOpen(true);
  }, []);

  const closeFormModal = useCallback(() => {
    setIsFormModalOpen(false);
    setSelectedLeadForEdit(null);
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setLeadFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Open Convert Modal
  const openConvertModal = useCallback(
    (lead: Lead) => {
      setSelectedLeadForConvert(lead);
      setConvertFormData({
        clientName: lead.name,
        email: '',
        phone: lead.whatsapp || '',
        whatsapp: lead.whatsapp || '',
        instagram: '',
        clientType: ClientType.DIRECT,
        projectName: lead.name,
        projectType: userProfile.projectTypes[0] || '',
        location: lead.location || '',
        address: lead.address || '',
        date: lead.eventDate || new Date().toISOString().split('T')[0],
        packageId: '',
        selectedAddOnIds: [],
        dp: '',
        dpDestinationCardId: '',
        notes: lead.notes || '',
        promoCodeId: '',
      });
      setIsConvertModalOpen(true);
    },
    [userProfile.projectTypes]
  );

  const closeConvertModal = useCallback(() => {
    setIsConvertModalOpen(false);
    setSelectedLeadForConvert(null);
  }, []);

  const handleConvertFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { id, checked } = e.target as HTMLInputElement;
      setConvertFormData((prev) => ({
        ...prev,
        selectedAddOnIds: checked
          ? [...prev.selectedAddOnIds, id]
          : prev.selectedAddOnIds.filter((addOnId) => addOnId !== id),
      }));
    } else {
      setConvertFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Detail Modal Controls
  const openDetailModal = useCallback((lead: Lead) => {
    setSelectedLeadForDetail(lead);
  }, []);

  const closeDetailModal = useCallback(() => {
    setSelectedLeadForDetail(null);
  }, []);

  // Share Modal Controls
  const openSharePackageModal = useCallback((lead: Lead) => {
    setSelectedLeadForShare(lead);
    setShareType('package');
    setIsShareModalOpen(true);
  }, []);

  const openShareBookingModal = useCallback((lead: Lead) => {
    setSelectedLeadForShare(lead);
    setShareType('booking');
    setIsShareModalOpen(true);
  }, []);

  const closeShareModal = useCallback(() => {
    setIsShareModalOpen(false);
    setSelectedLeadForShare(null);
  }, []);

  // Stats Modal Controls
  const openStatsModal = useCallback((title: string, leadsList: Lead[]) => {
    setStatsModal({
      isOpen: true,
      title,
      leads: leadsList,
    });
  }, []);

  const closeStatsModal = useCallback(() => {
    setStatsModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Handle Initial Deep-Link Actions
  useEffect(() => {
    if (initialAction?.id && leads.length > 0) {
      const target = leads.find((l) => l.id === initialAction.id);
      if (target) {
        if (initialAction.type === 'edit-lead') {
          openEditModal(target);
        } else if (initialAction.type === 'convert-lead') {
          openConvertModal(target);
        } else {
          openDetailModal(target);
        }
        if (setInitialAction) setInitialAction(null);
      }
    }
  }, [initialAction, leads, openEditModal, openConvertModal, openDetailModal, setInitialAction]);

  return {
    // Form Modal
    isFormModalOpen,
    formModalMode,
    selectedLeadForEdit,
    leadFormData,
    openAddModal,
    openEditModal,
    closeFormModal,
    handleFormChange,

    // Convert Modal
    isConvertModalOpen,
    selectedLeadForConvert,
    convertFormData,
    setConvertFormData,
    openConvertModal,
    closeConvertModal,
    handleConvertFormChange,

    // Detail Modal
    isDetailModalOpen: Boolean(selectedLeadForDetail),
    selectedLeadForDetail,
    openDetailModal,
    closeDetailModal,

    // Share Modal
    isShareModalOpen,
    shareType,
    selectedLeadForShare,
    openSharePackageModal,
    openShareBookingModal,
    closeShareModal,

    // Stats Modal
    statsModal,
    openStatsModal,
    closeStatsModal,
  };
}
