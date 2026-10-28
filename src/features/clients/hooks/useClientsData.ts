import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Client, Project, Transaction } from '../types';
import { deleteClient } from '../services/clients.service';
import { deleteProject as deleteProjectRow } from '../../../services/projects';
import { ensureOnlineOrNotify } from '../utils/clientHelpers';
import { invalidateClientsCache, invalidateProjectsCache } from '../../../services/cacheInvalidation';

interface UseClientsDataParams {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  showNotification: (message: string) => void;
}

export function useClientsData({
  clients,
  setClients,
  projects,
  setProjects,
  setTransactions,
  showNotification,
}: UseClientsDataParams) {
  const queryClient = useQueryClient();

  const handleDeleteClient = useCallback(
    async (clientId: string) => {
      if (
        !window.confirm(
          'Menghapus pengantin akan menghapus semua Acara Pernikahan dan transaksi terkait. Apakah Anda yakin?'
        )
      ) {
        return false;
      }

      if (!ensureOnlineOrNotify(showNotification)) return false;
      try {
        await deleteClient(clientId);
        setClients(prev => prev.filter(c => c.id !== clientId));
        const projectsToDelete = projects.filter(p => p.clientId === clientId).map(p => p.id);
        setProjects(prev => prev.filter(p => p.clientId !== clientId));
        setTransactions(prev => prev.filter(t => !projectsToDelete.includes(t.projectId || '')));
        void invalidateClientsCache(queryClient);
        showNotification('Pengantin berhasil dihapus.');
        return true;
      } catch (err) {
        showNotification(
          !navigator.onLine
            ? 'Harus online untuk melakukan perubahan'
            : 'Gagal menghapus pengantin di database. Coba lagi.'
        );
        return false;
      }
    },
    [projects, queryClient, setClients, setProjects, setTransactions, showNotification]
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (
        !window.confirm(
          'Hapus Acara Pernikahan ini? Semua transaksi terkait akan tetap ada, tetapi tidak lagi terhubung ke Acara Pernikahan. Lanjutkan?'
        )
      ) {
        return false;
      }

      if (!ensureOnlineOrNotify(showNotification)) return false;
      const success = await deleteProjectRow(projectId);
      if (success) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        void invalidateProjectsCache(queryClient);
        showNotification('Acara Pernikahan berhasil dihapus.');
        return true;
      } else {
        showNotification(
          !navigator.onLine
            ? 'Harus online untuk melakukan perubahan'
            : 'Gagal menghapus Acara Pernikahan di database. Coba lagi.'
        );
        return false;
      }
    },
    [queryClient, setProjects, showNotification]
  );

  return {
    handleDeleteClient,
    handleDeleteProject,
  };
}

export default useClientsData;
