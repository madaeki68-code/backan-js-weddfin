import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Project,
  Client,
  Transaction,
  Card,
  FinancialPocket,
  TeamProjectPayment,
  TeamPaymentRecord,
  PaymentStatus,
  TransactionType,
  CardType,
  TeamMember,
} from '../../../types';
import { weddingDetailService } from '../services/weddingDetail.service';
import {
  invalidateProjectsCache,
  invalidateFinanceCache,
  invalidateTeamCache,
} from '../../../services/cacheInvalidation';

export interface UseWeddingPaymentParams {
  client: Client | null;
  activeProject: Project | null;
  setProjects?: React.Dispatch<React.SetStateAction<Project[]>>;
  transactions: Transaction[];
  setTransactions?: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cards: Card[];
  setCards?: React.Dispatch<React.SetStateAction<Card[]>>;
  pockets: FinancialPocket[];
  setPockets?: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
  teamMembers: TeamMember[];
  teamProjectPayments: TeamProjectPayment[];
  setTeamProjectPayments?: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
  teamPaymentRecords?: TeamPaymentRecord[];
  setTeamPaymentRecords?: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
  showNotification: (message: string) => void;
}

export function useWeddingPayment({
  client,
  activeProject,
  setProjects,
  setTransactions,
  cards,
  setCards,
  pockets,
  setPockets,
  teamMembers,
  teamProjectPayments,
  setTeamProjectPayments,
  setTeamPaymentRecords,
  showNotification,
}: UseWeddingPaymentParams) {
  const queryClient = useQueryClient();
  const [isRecordingPayment, setIsRecordingPayment] = useState(false);
  const [isAddingExpense, setIsAddingExpense] = useState(false);

  // Record payment (DP or pelunasan)
  const recordPayment = useCallback(
    async (amount: number, destinationCardId: string, proofFile?: File | null) => {
      if (!activeProject || !client) {
        showNotification('Acara pengantin tidak ditemukan.');
        return;
      }
      if (amount <= 0) {
        showNotification('Jumlah pembayaran harus lebih dari 0.');
        return;
      }

      setIsRecordingPayment(true);
      try {
        let proofUrl: string | undefined;
        if (proofFile) {
          proofUrl = await weddingDetailService.uploadPaymentProof(proofFile, client.name);
        }

        const today = new Date().toISOString().split('T')[0];
        const newTx = await weddingDetailService.recordIncomeTransaction({
          projectId: activeProject.id,
          clientName: client.name,
          amount,
          destinationCardId,
          description: `Pembayaran ${activeProject.projectName}`,
          proofUrl,
        });

        // Update cards balance
        if (destinationCardId && setCards) {
          setCards(prev =>
            prev.map(c =>
              c.id === destinationCardId ? { ...c, balance: (c.balance || 0) + amount } : c
            )
          );
        }

        // Calculate new payment status & amount
        const newAmountPaid = (activeProject.amountPaid || 0) + amount;
        let newPaymentStatus = PaymentStatus.BELUM_BAYAR;
        if (newAmountPaid >= activeProject.totalCost) {
          newPaymentStatus = PaymentStatus.LUNAS;
        } else if (newAmountPaid > 0) {
          newPaymentStatus = PaymentStatus.DP_TERBAYAR;
        }

        const newPaymentProofs = proofUrl
          ? [...(activeProject.paymentProofs || []), { url: proofUrl, amount, date: today }]
          : activeProject.paymentProofs;

        const updatedProject: Project = {
          ...activeProject,
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus,
          paymentProofs: newPaymentProofs,
        };

        setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updatedProject : p)));

        await weddingDetailService.updateProject(activeProject.id, {
          amountPaid: newAmountPaid,
          paymentStatus: newPaymentStatus,
          ...(proofUrl ? { paymentProofs: newPaymentProofs } : {}),
        });

        // Add to transactions state
        setTransactions?.(prev => [newTx, ...prev]);

        await Promise.all([
          invalidateProjectsCache(queryClient),
          invalidateFinanceCache(queryClient),
        ]);

        showNotification('Pembayaran berhasil dicatat.');
      } catch (err) {
        console.error('[WeddingPayment] Failed to record payment:', err);
        showNotification('Gagal mencatat pembayaran.');
      } finally {
        setIsRecordingPayment(false);
      }
    },
    [activeProject, client, setCards, setProjects, setTransactions, queryClient, showNotification]
  );

  // Extra charges
  const addExtraCharge = useCallback(
    async (name: string, amount: number) => {
      if (!activeProject) return;
      if (!name.trim() || amount <= 0) {
        showNotification('Nama biaya tambahan dan jumlah harus diisi.');
        return;
      }

      const newCharge = {
        id: `charge-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: name.trim(),
        amount,
      };

      const updatedCharges = [...(activeProject.extraCharges || []), newCharge];
      const newTotalCost = (activeProject.totalCost || 0) + amount;

      const updatedProject: Project = {
        ...activeProject,
        extraCharges: updatedCharges,
        totalCost: newTotalCost,
      };

      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updatedProject : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, {
          extraCharges: updatedCharges,
          totalCost: newTotalCost,
        });
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        showNotification(`Biaya tambahan "${name}" ditambahkan.`);
      } catch (err) {
        console.error('[WeddingPayment] Failed to add extra charge:', err);
        showNotification('Gagal menambahkan biaya tambahan.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  const deleteExtraCharge = useCallback(
    async (chargeId: string) => {
      if (!activeProject) return;
      const charge = activeProject.extraCharges?.find(c => c.id === chargeId);
      if (!charge) return;

      const updatedCharges = (activeProject.extraCharges || []).filter(c => c.id !== chargeId);
      const newTotalCost = Math.max(0, (activeProject.totalCost || 0) - charge.amount);

      const updatedProject: Project = {
        ...activeProject,
        extraCharges: updatedCharges,
        totalCost: newTotalCost,
      };

      setProjects?.(prev => prev.map(p => (p.id === activeProject.id ? updatedProject : p)));

      try {
        await weddingDetailService.updateProject(activeProject.id, {
          extraCharges: updatedCharges,
          totalCost: newTotalCost,
        });
        await queryClient.invalidateQueries({ queryKey: ['projects'] });
        showNotification('Biaya tambahan dihapus.');
      } catch (err) {
        console.error('[WeddingPayment] Failed to delete extra charge:', err);
        showNotification('Gagal menghapus biaya tambahan.');
      }
    },
    [activeProject, setProjects, queryClient, showNotification]
  );

  // Project expense
  const addProjectExpense = useCallback(
    async (data: { date: string; description: string; amount: number; category: string; sourceId: string }) => {
      if (!activeProject || !client) return;
      setIsAddingExpense(true);
      try {
        // Determine whether source is pocket or card
        const isPocket = pockets.some(p => p.id === data.sourceId);
        const sourceType = isPocket ? ('pocket' as const) : ('card' as const);

        const newTx = await weddingDetailService.recordExpenseTransaction({
          projectId: activeProject.id,
          clientName: client.name,
          amount: data.amount,
          sourceId: data.sourceId,
          sourceType,
          category: data.category,
          description: data.description,
          date: data.date,
        });

        // Deduct balance
        if (isPocket && setPockets) {
          setPockets(prev =>
            prev.map(p => (p.id === data.sourceId ? { ...p, amount: (p.amount || 0) - data.amount } : p))
          );
        } else if (setCards) {
          setCards(prev =>
            prev.map(c => (c.id === data.sourceId ? { ...c, balance: (c.balance || 0) - data.amount } : c))
          );
        }

        setTransactions?.(prev => [newTx, ...prev]);

        await invalidateFinanceCache(queryClient);

        showNotification('Pengeluaran acara berhasil dicatat.');
      } catch (err) {
        console.error('[WeddingPayment] Failed to record expense:', err);
        showNotification('Gagal mencatat pengeluaran.');
      } finally {
        setIsAddingExpense(false);
      }
    },
    [activeProject, client, pockets, setPockets, setCards, setTransactions, queryClient, showNotification]
  );

  const deleteProjectExpense = useCallback(
    async (txId: string) => {
      try {
        await weddingDetailService.deleteExpenseTransaction(txId);
        setTransactions?.(prev => prev.filter(t => t.id !== txId));
        await invalidateFinanceCache(queryClient);
        showNotification('Pengeluaran berhasil dihapus.');
      } catch (err) {
        console.error('[WeddingPayment] Failed to delete expense:', err);
        showNotification('Gagal menghapus pengeluaran.');
      }
    },
    [setTransactions, queryClient, showNotification]
  );

  // Pay Team Member
  const payTeamMember = useCallback(
    async (payment: TeamProjectPayment, sourceId: string) => {
      if (!activeProject || !client) return;
      const member = teamMembers.find(m => m.id === payment.teamMemberId);
      if (!member) {
        showNotification('Anggota tim tidak ditemukan.');
        return;
      }

      try {
        const today = new Date().toISOString().split('T')[0];
        const isPocket = pockets.some(p => p.id === sourceId);
        const sourceCard = cards.find(c => c.id === sourceId);
        const sourcePocket = pockets.find(p => p.id === sourceId);
        const sourceName = isPocket
          ? sourcePocket?.name || 'Kas Kecil'
          : sourceCard?.name || sourceCard?.bankName || 'Rekening';

        // Update payment status
        const updatedPayment: TeamProjectPayment = {
          ...payment,
          status: 'Paid',
          paidAt: today,
          paymentSource: sourceName,
        };

        const nextPayments = teamProjectPayments.map(p =>
          p.id === payment.id ? updatedPayment : p
        );
        setTeamProjectPayments?.(nextPayments);

        // Record expense transaction
        const tx = await weddingDetailService.recordExpenseTransaction({
          projectId: activeProject.id,
          clientName: client.name,
          amount: payment.fee,
          sourceId,
          sourceType: isPocket ? ('pocket' as const) : ('card' as const),
          category: 'Honor Tim',
          description: `Honor ${member.name} (${payment.role || 'Crew'}) — ${activeProject.projectName}`,
          date: today,
        });

        // Create payment slip record
        const slip = await weddingDetailService.recordTeamPaymentSlip({
          recordNumber: `SLIP-${Date.now()}`,
          teamMemberId: member.id,
          teamMemberName: member.name,
          paymentId: payment.id,
          date: today,
          projectPaymentIds: [payment.id],
          totalAmount: payment.fee,
          amount: payment.fee,
          role: payment.role || 'Crew',
          projectName: activeProject.projectName,
          paymentMethod: sourceName,
        });

        setTeamPaymentRecords?.(prev => [slip, ...prev]);

        // Deduct balance
        if (isPocket && setPockets) {
          setPockets(prev =>
            prev.map(p => (p.id === sourceId ? { ...p, amount: (p.amount || 0) - payment.fee } : p))
          );
        } else if (setCards) {
          setCards(prev =>
            prev.map(c => (c.id === sourceId ? { ...c, balance: (c.balance || 0) - payment.fee } : c))
          );
        }

        setTransactions?.(prev => [tx, ...prev]);

        await Promise.all([
          invalidateTeamCache(queryClient),
          invalidateFinanceCache(queryClient),
        ]);

        showNotification(`Honor ${member.name} berhasil dibayarkan.`);
      } catch (err) {
        console.error('[WeddingPayment] Failed to pay team member:', err);
        showNotification('Gagal memproses pembayaran tim.');
      }
    },
    [
      activeProject,
      client,
      teamMembers,
      teamProjectPayments,
      setTeamProjectPayments,
      setTeamPaymentRecords,
      pockets,
      cards,
      setPockets,
      setCards,
      setTransactions,
      queryClient,
      showNotification,
    ]
  );

  return {
    isRecordingPayment,
    isAddingExpense,
    recordPayment,
    addExtraCharge,
    deleteExtraCharge,
    addProjectExpense,
    deleteProjectExpense,
    payTeamMember,
  };
}
