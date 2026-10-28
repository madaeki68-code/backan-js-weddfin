import { useState, useMemo, useCallback } from 'react';
import { Client, Project, Lead } from '../../../types';
import { ClientReminder } from '../types';
import {
  computeClientReminders,
  isReminderAlreadySent,
} from '../utils/reminders';
import {
  getSentReminderKeys,
  markReminderSent,
  clearSentReminderKeys,
} from '../services/clientCommunicationService';

export function useClientReminders(
  clients: Client[],
  projects: Project[],
  leads: Lead[] = [],
  options?: { maxDaysAhead?: number }
) {
  const [sentKeys, setSentKeys] = useState<string[]>(() => getSentReminderKeys());

  const reminders = useMemo(() => {
    return computeClientReminders(clients, projects, leads, {
      sentReminderKeys: sentKeys,
      maxDaysAhead: options?.maxDaysAhead ?? 14,
    });
  }, [clients, projects, leads, sentKeys, options?.maxDaysAhead]);

  const overdueReminders = useMemo(() => {
    return reminders.filter(r => r.isOverdue && !isReminderAlreadySent(r.id, sentKeys));
  }, [reminders, sentKeys]);

  const upcomingReminders = useMemo(() => {
    return reminders.filter(r => !r.isOverdue && !isReminderAlreadySent(r.id, sentKeys));
  }, [reminders, sentKeys]);

  const handleMarkSent = useCallback((reminderId: string) => {
    markReminderSent(reminderId);
    setSentKeys(prev => (prev.includes(reminderId) ? prev : [...prev, reminderId]));
  }, []);

  const handleResetSent = useCallback(() => {
    clearSentReminderKeys();
    setSentKeys([]);
  }, []);

  return {
    reminders,
    overdueReminders,
    upcomingReminders,
    pendingCount: overdueReminders.length + upcomingReminders.length,
    sentKeys,
    markReminderSent: handleMarkSent,
    resetSentReminders: handleResetSent,
  };
}
