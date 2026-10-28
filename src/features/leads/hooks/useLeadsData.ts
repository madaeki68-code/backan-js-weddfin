import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Lead,
  LeadStatus,
  Client,
  Project,
  Package,
  AddOn,
  Transaction,
  Profile,
  Card,
  FinancialPocket,
  PromoCode,
} from '../../../types';
import { resolveLeadStatus } from '../../../constants';
import { logger } from '../../../lib/logger';
import { statusConfig } from '../constants/leads.constants';
import {
  createLeadRow,
  updateLeadRow,
  deleteLeadRow,
  convertLeadWorkflow,
} from '../services/leads.service';
import type { LeadFormData, ConvertLeadFormData, LeadModalMode } from '../types/leads.types';
import {
  invalidateLeadsCache,
  invalidateClientsCache,
  invalidateProjectsCache,
  invalidateFinanceCache,
} from '../../../services/cacheInvalidation';

export interface UseLeadsDataProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  clients?: Client[];
  setClients?: React.Dispatch<React.SetStateAction<Client[]>>;
  projects?: Project[];
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  packages?: Package[];
  addOns?: AddOn[];
  transactions?: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  userProfile?: Profile;
  showNotification?: (message: string, duration?: number) => void;
  cards?: Card[];
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets?: FinancialPocket[];
  setPockets?: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  promoCodes?: PromoCode[];
  setPromoCodes?: React.Dispatch<React.SetStateAction<PromoCode[]>>;
  onOpenConvertModal?: (lead: Lead) => void;
}

export function useLeadsData({
  leads = [],
  setLeads,
  setClients = () => {},
  packages = [],
  addOns = [],
  setProjects = () => {},
  setTransactions = () => {},
  cards = [],
  setCards = () => {},
  promoCodes = [],
  setPromoCodes = () => {},
  showNotification = () => {},
  onOpenConvertModal,
}: UseLeadsDataProps) {
  const queryClient = useQueryClient();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    void queryClient.invalidateQueries({ queryKey: ['leads', 'page'] });
  }, [leads, queryClient]);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();

  const handleMoveStatus = (leadId: string, newStatus: LeadStatus) => {
    const leadToUpdate = leads.find((l) => l.id === leadId);
    if (!leadToUpdate) return;
    if (leadToUpdate.status === newStatus) return;

    if (newStatus === LeadStatus.CONVERTED) {
      if (onOpenConvertModal) {
        onOpenConvertModal(leadToUpdate);
      }
      return;
    }

    if (resolveLeadStatus(leadToUpdate) === LeadStatus.CONVERTED) {
      const targetTitle = statusConfig[newStatus]?.title || newStatus;
      if (
        !window.confirm(
          `Calon Pengantin "${leadToUpdate.name}" tercatat sudah dikonversi.\n\nYakin ingin memindahkannya ke "${targetTitle}"? Catatan konversinya tetap tersimpan, jadi kartu ini tetap muncul di kolom Dikonversi.`
        )
      ) {
        return;
      }
    }

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId ? { ...l, status: newStatus, date: new Date().toISOString() } : l
      )
    );

    void updateLeadRow(leadId, {
      status: newStatus,
      date: new Date().toISOString().split('T')[0],
    }).catch((err) => {
      logger.warn('[Supabase] update lead status failed', err);
      showNotification('Gagal memperbarui status Calon Pengantin di database.');
    });

    showNotification(
      `Calon Pengantin "${leadToUpdate.name}" berhasil dipindahkan ke "${
        statusConfig[newStatus]?.title || newStatus
      }".`
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: LeadStatus) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      handleMoveStatus(leadId, newStatus);
    }
    setDraggedLeadId(null);
  };

  const handleNextStatus = (leadId: string, currentStatus: LeadStatus) => {
    let newStatus: LeadStatus | null = null;
    if (currentStatus === LeadStatus.DISCUSSION) newStatus = LeadStatus.FOLLOW_UP;
    if (currentStatus === LeadStatus.FOLLOW_UP) newStatus = LeadStatus.CONVERTED;
    if (newStatus) {
      handleMoveStatus(leadId, newStatus);
    }
  };

  const handleDeleteLead = async (leadId: string) => {
    if (!window.confirm('Hapus Calon Pengantin ini?')) return;
    try {
      await deleteLeadRow(leadId);
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
      void invalidateLeadsCache(queryClient);
      showNotification('Calon Pengantin berhasil dihapus.');
    } catch {
      alert('Gagal menghapus Calon Pengantin di database. Coba lagi.');
    }
  };

  const handleSaveLead = async (formData: LeadFormData, mode: LeadModalMode, leadId?: string) => {
    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        const created = await createLeadRow({
          name: formData.name,
          contactChannel: formData.contactChannel,
          location: formData.location || '',
          status: formData.status || LeadStatus.DISCUSSION,
          date: new Date().toISOString().split('T')[0],
          notes: formData.notes || undefined,
          whatsapp: formData.whatsapp || undefined,
          address: formData.address || undefined,
          eventDate: formData.eventDate || undefined,
        } as Omit<Lead, 'id'>);
        setLeads((prev) => [created, ...prev]);
        void invalidateLeadsCache(queryClient);
        showNotification('Calon Pengantin baru berhasil ditambahkan.');
        return true;
      } else if (leadId) {
        const updated = await updateLeadRow(leadId, {
          name: formData.name,
          contactChannel: formData.contactChannel,
          location: formData.location || '',
          status: formData.status,
          notes: formData.notes || undefined,
          whatsapp: formData.whatsapp || undefined,
          address: formData.address || undefined,
          eventDate: formData.eventDate || undefined,
        });
        setLeads((prev) => prev.map((l) => (l.id === leadId ? updated : l)));
        void invalidateLeadsCache(queryClient);
        showNotification('Calon Pengantin berhasil diperbarui.');
        return true;
      }
      return false;
    } catch {
      alert('Gagal menyimpan Calon Pengantin ke database. Coba lagi.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertLead = async (lead: Lead, formData: ConvertLeadFormData) => {
    setIsSubmitting(true);
    try {
      const result = await convertLeadWorkflow({
        lead,
        formData,
        packages,
        addOns,
        promoCodes,
        cards,
      });

      setClients((prev) => [result.createdClient, ...prev]);
      setProjects((prev) => [result.createdProject, ...prev]);

      if (result.createdTransaction) {
        const createdTx = result.createdTransaction;
        setTransactions((prev) => {
          const exists = prev.some((t) => t.id === createdTx.id);
          const list = exists
            ? prev.map((t) => (t.id === createdTx.id ? createdTx : t))
            : [createdTx, ...prev];
          return list.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
        });
      }

      if (result.updatedCardId && result.updatedCardBalanceDelta) {
        const cardId = result.updatedCardId;
        const delta = result.updatedCardBalanceDelta;
        setCards((prev) =>
          prev.map((c) => (c.id === cardId ? { ...c, balance: c.balance + delta } : c))
        );
      }

      if (result.promoCodeIdUsed) {
        const pid = result.promoCodeIdUsed;
        setPromoCodes((prev) =>
          prev.map((p) => (p.id === pid ? { ...p, usageCount: p.usageCount + 1 } : p))
        );
      }

      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id
            ? { ...l, status: LeadStatus.CONVERTED, notes: result.conversionNote }
            : l
        )
      );

      void invalidateLeadsCache(queryClient);
      void invalidateClientsCache(queryClient);
      void invalidateProjectsCache(queryClient);
      void invalidateFinanceCache(queryClient);

      showNotification(
        `Calon Pengantin ${lead.name} berhasil dikonversi menjadi pengantin!`
      );
      return true;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengkonversi Calon Pengantin. Coba lagi.';
      alert(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    draggedLeadId,
    isSubmitting,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleStatusChange: handleMoveStatus,
    handleNextStatus,
    handleDeleteLead,
    handleSaveLead,
    handleConvertLead,
  };
}
