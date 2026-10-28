import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Client,
  Project,
  PaymentStatus,
  Package,
  Transaction,
  TransactionType,
  Card,
  Profile,
  TeamMember,
  TeamProjectPayment,
  TeamPaymentRecord,
  FinancialPocket,
} from '../../../types';
import { weddingDetailService } from '../services/weddingDetail.service';
import { invalidateProjectsCache } from '../../../services/cacheInvalidation';
import {
  WeddingDetailTab,
  WeddingFinancialSummary,
  WeddingProgressSummary,
} from '../types/weddingDetail.types';
import { ProjectMeeting } from '../../../services/calendarEvents';

export interface UseWeddingDetailParams {
  client: Client | null;
  projects: Project[];
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  transactions: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  packages: Package[];
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments?: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  cards: Card[];
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets?: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  profile: Profile;
  showNotification: (message: string) => void;
  initialProjectId?: string;
  initialTab?: WeddingDetailTab;
}

export function useWeddingDetail({
  client,
  projects,
  setProjects,
  transactions,
  packages,
  teamMembers,
  teamProjectPayments,
  teamPaymentRecords = [],
  cards,
  pockets,
  profile,
  showNotification,
  initialProjectId,
  initialTab = 'overview',
}: UseWeddingDetailParams) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WeddingDetailTab>(initialTab);

  const clientProjects = useMemo(() => {
    if (!client) return [];
    return projects.filter(p => p.clientId === client.id);
  }, [client, projects]);

  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    if (initialProjectId) return initialProjectId;
    if (clientProjects.length > 0) return clientProjects[0].id;
    return null;
  });

  useEffect(() => {
    if (clientProjects.length > 0 && (!activeProjectId || !clientProjects.some(p => p.id === activeProjectId))) {
      setActiveProjectId(clientProjects[0].id);
    }
  }, [clientProjects, activeProjectId]);

  const activeProject = useMemo(() => {
    if (!activeProjectId) return clientProjects[0] || null;
    return clientProjects.find(p => p.id === activeProjectId) || clientProjects[0] || null;
  }, [clientProjects, activeProjectId]);

  const projectTransactions = useMemo(() => {
    if (activeProject) {
      return transactions.filter(t => t.projectId === activeProject.id);
    }
    if (client) {
      return transactions.filter(t => clientProjects.some(p => p.id === t.projectId));
    }
    return [];
  }, [activeProject, client, clientProjects, transactions]);

  const selectedPackage = useMemo(() => {
    if (!activeProject?.packageId) return null;
    return packages.find(p => p.id === activeProject.packageId) || null;
  }, [activeProject, packages]);

  // Project meetings state
  const [meetings, setMeetings] = useState<ProjectMeeting[]>([]);
  const [loadingMeetings, setLoadingMeetings] = useState(false);

  const loadMeetings = useCallback(async () => {
    if (!activeProject?.id) {
      setMeetings([]);
      return;
    }
    setLoadingMeetings(true);
    try {
      const list = await weddingDetailService.getMeetings(activeProject.id);
      setMeetings(list);
    } catch (err) {
      console.warn('[WeddingDetail] Could not load meetings:', err);
    } finally {
      setLoadingMeetings(false);
    }
  }, [activeProject?.id]);

  useEffect(() => {
    void loadMeetings();
  }, [loadMeetings]);

  // Financial calculations
  const financial: WeddingFinancialSummary = useMemo(() => {
    const totalCost = activeProject?.totalCost || 0;
    const amountPaid = activeProject?.amountPaid || 0;
    const remainingBalance = Math.max(0, totalCost - amountPaid);

    let paymentStatus = PaymentStatus.BELUM_BAYAR;
    if (amountPaid >= totalCost && totalCost > 0) {
      paymentStatus = PaymentStatus.LUNAS;
    } else if (amountPaid > 0) {
      paymentStatus = PaymentStatus.DP_TERBAYAR;
    }

    const eventDateParts = activeProject?.date?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const eventDayUtc = eventDateParts
      ? Date.UTC(Number(eventDateParts[1]), Number(eventDateParts[2]) - 1, Number(eventDateParts[3]))
      : null;
    const today = new Date();
    const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
    const overdueDays = eventDayUtc === null ? 0 : Math.floor((todayUtc - eventDayUtc) / 86400000);
    const isOverdue = overdueDays > 0 && !/selesai|dibatalkan/i.test(activeProject?.status || '');

    const currentProjectPayments = teamProjectPayments.filter(
      p => activeProject && p.projectId === activeProject.id
    );
    const totalTeamFees = currentProjectPayments.reduce((sum, p) => sum + (p.fee || 0), 0);

    const expenseTxs = projectTransactions.filter(t => t.type === TransactionType.EXPENSE);
    const totalExpenses = expenseTxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const estimatedProfit = totalCost - totalTeamFees - totalExpenses;

    return {
      totalCost,
      amountPaid,
      remainingBalance,
      paymentStatus,
      isOverdue,
      overdueDays,
      totalTeamFees,
      totalExpenses,
      estimatedProfit,
    };
  }, [activeProject, teamProjectPayments, projectTransactions]);

  // Progress summary
  const progress: WeddingProgressSummary = useMemo(() => {
    const allSubStatuses =
      activeProject?.customSubStatuses ||
      profile.projectStatusConfig?.find(s => s.name === activeProject?.status)?.subStatuses ||
      [];
    const activeSubList = activeProject?.activeSubStatuses || [];
    const completedCount = allSubStatuses.filter(s => activeSubList.includes(s.name)).length;
    const totalCount = allSubStatuses.length;
    const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      currentStatus: activeProject?.status || 'Menunggu Konfirmasi',
      completedSubStatuses: completedCount,
      totalSubStatuses: totalCount,
      percent,
    };
  }, [activeProject, profile.projectStatusConfig]);

  // Sub-status toggle
  const onToggleSubStatus = useCallback(
    async (subStatusName: string, active: boolean) => {
      if (!activeProject) return;
      const currentActive = activeProject.activeSubStatuses || [];
      const nextActive = active
        ? Array.from(new Set([...currentActive, subStatusName]))
        : currentActive.filter(n => n !== subStatusName);

      const updated = { ...activeProject, activeSubStatuses: nextActive };
      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updated : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, {
          activeSubStatuses: nextActive as any,
        });
        await invalidateProjectsCache(queryClient);
        showNotification(active ? `Tahapan "${subStatusName}" selesai.` : `Tahapan "${subStatusName}" dibatalkan.`);
      } catch (err) {
        console.error('[WeddingDetail] Failed to toggle sub-status:', err);
        showNotification('Gagal memperbarui tahapan.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  // Status update
  const onUpdateProjectStatus = useCallback(
    async (newStatus: string) => {
      if (!activeProject) return;
      const updated = { ...activeProject, status: newStatus };
      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updated : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, { status: newStatus });
        await invalidateProjectsCache(queryClient);
        showNotification(`Status acara diperbarui menjadi "${newStatus}".`);
      } catch (err) {
        console.error('[WeddingDetail] Failed to update project status:', err);
        showNotification('Gagal memperbarui status acara.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  // Final Drive Link
  const onSaveFinalDriveLink = useCallback(
    async (link: string) => {
      if (!activeProject) return;
      const updated = { ...activeProject, finalDriveLink: link };
      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updated : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, { finalDriveLink: link });
        await invalidateProjectsCache(queryClient);
        showNotification('Link File Jadi berhasil disimpan.');
      } catch (err) {
        console.error('[WeddingDetail] Failed to save drive link:', err);
        showNotification('Gagal menyimpan link drive.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  // Meetings
  const onAddMeeting = useCallback(
    async (meetingData: any) => {
      if (!activeProject) return;
      try {
        const created = await weddingDetailService.addMeeting({
          ...meetingData,
          projectId: activeProject.id,
        });
        setMeetings(prev => [...prev, created]);
        await invalidateProjectsCache(queryClient);
        showNotification('Jadwal meeting berhasil ditambahkan.');
      } catch (err) {
        console.error('[WeddingDetail] Failed to add meeting:', err);
        showNotification('Gagal menambahkan jadwal meeting.');
      }
    },
    [activeProject, queryClient, showNotification]
  );

  const onDeleteMeeting = useCallback(
    async (meetingId: string) => {
      try {
        await weddingDetailService.deleteMeeting(meetingId);
        setMeetings(prev => prev.filter(m => m.event.id !== meetingId));
        await invalidateProjectsCache(queryClient);
        showNotification('Jadwal meeting berhasil dihapus.');
      } catch (err) {
        console.error('[WeddingDetail] Failed to delete meeting:', err);
        showNotification('Gagal menghapus meeting.');
      }
    },
    [queryClient, showNotification]
  );

  const onUpdateNotes = useCallback(
    async (notes: string) => {
      if (!activeProject) return;
      const updated = { ...activeProject, notes };
      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updated : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, { notes });
        await invalidateProjectsCache(queryClient);
        showNotification('Catatan acara berhasil disimpan.');
      } catch (err) {
        console.error('[WeddingDetail] Failed to save notes:', err);
        showNotification('Gagal menyimpan catatan.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  return {
    activeTab,
    setActiveTab,
    clientProjects,
    activeProject,
    activeProjectId,
    setActiveProjectId,
    projectTransactions,
    selectedPackage,
    meetings,
    loadingMeetings,
    financial,
    progress,
    onToggleSubStatus,
    onUpdateProjectStatus,
    onSaveFinalDriveLink,
    onAddMeeting,
    onDeleteMeeting,
    onUpdateNotes,
    teamMembers,
    teamProjectPayments,
    teamPaymentRecords,
    cards,
    pockets,
    profile,
  };
}
