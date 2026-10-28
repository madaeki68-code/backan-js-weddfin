import { useState, useEffect, useCallback } from 'react';
import { ClientInteractionLog } from '../types';
import {
  getInteractionHistory,
  logClientInteraction,
  deleteInteractionLog,
  clearInteractionHistory,
} from '../services/clientCommunicationService';

export function useCommunicationHistory(clientId: string | null | undefined) {
  const [history, setHistory] = useState<ClientInteractionLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadHistory = useCallback(() => {
    if (!clientId) {
      setHistory([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const data = getInteractionHistory(clientId);
    setHistory(data);
    setIsLoading(false);
  }, [clientId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const addLog = useCallback(
    (
      payload: Omit<ClientInteractionLog, 'id' | 'timestamp' | 'clientId'> & {
        clientId?: string;
      }
    ) => {
      const targetClientId = payload.clientId || clientId;
      if (!targetClientId) return null;

      const created = logClientInteraction({
        ...payload,
        clientId: targetClientId,
      });

      // Update state if for active client
      if (targetClientId === clientId) {
        setHistory(prev => [created, ...prev]);
      }
      return created;
    },
    [clientId]
  );

  const removeLog = useCallback(
    (logId: string) => {
      if (!clientId || !logId) return;
      deleteInteractionLog(clientId, logId);
      setHistory(prev => prev.filter(item => item.id !== logId));
    },
    [clientId]
  );

  const clearAll = useCallback(() => {
    if (!clientId) return;
    clearInteractionHistory(clientId);
    setHistory([]);
  }, [clientId]);

  return {
    history,
    isLoading,
    addLog,
    removeLog,
    clearAll,
    reload: loadHistory,
  };
}
