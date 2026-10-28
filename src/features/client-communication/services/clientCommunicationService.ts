import { Profile } from '../../../types';
import {
  ClientInteractionLog,
  ClientFollowUp,
  CommunicationTemplate,
  FollowUpStatus,
} from '../types';
import {
  CLIENT_COMMUNICATION_STORAGE_KEYS,
  DEFAULT_COMMUNICATION_TEMPLATES,
} from '../constants';
import { filterInteractionsForClient } from '../utils/clientIsolation';
import { getChatTemplatesOffline } from '../../../services/chatTemplatesOffline';

// ── In-Memory fallback for environments without localStorage ───
const inMemoryStore = new Map<string, string>();

function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return inMemoryStore.get(key) || null;
  } catch {
    return inMemoryStore.get(key) || null;
  }
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
    inMemoryStore.set(key, value);
  } catch {
    inMemoryStore.set(key, value);
  }
}

// ── 1. Client Interaction History (Strictly Isolated by clientId) ─

export function getClientInteractionStorageKey(clientId: string): string {
  return `${CLIENT_COMMUNICATION_STORAGE_KEYS.INTERACTIONS_PREFIX}${clientId}`;
}

export function getInteractionHistory(clientId: string): ClientInteractionLog[] {
  if (!clientId) return [];
  const key = getClientInteractionStorageKey(clientId);
  const raw = safeGetItem(key);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Strict isolation filter
    return filterInteractionsForClient(parsed as ClientInteractionLog[], clientId);
  } catch (e) {
    console.warn(`[ClientCommunication] Error parsing interaction history for client ${clientId}:`, e);
    return [];
  }
}

export function logClientInteraction(
  payload: Omit<ClientInteractionLog, 'id' | 'timestamp'>
): ClientInteractionLog {
  const newLog: ClientInteractionLog = {
    ...payload,
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  const current = getInteractionHistory(payload.clientId);
  const updated = [newLog, ...current];
  const key = getClientInteractionStorageKey(payload.clientId);
  safeSetItem(key, JSON.stringify(updated));

  return newLog;
}

export function deleteInteractionLog(clientId: string, logId: string): void {
  if (!clientId || !logId) return;
  const current = getInteractionHistory(clientId);
  const updated = current.filter(item => item.id !== logId);
  const key = getClientInteractionStorageKey(clientId);
  safeSetItem(key, JSON.stringify(updated));
}

export function clearInteractionHistory(clientId: string): void {
  if (!clientId) return;
  const key = getClientInteractionStorageKey(clientId);
  safeSetItem(key, JSON.stringify([]));
}

// ── 2. Follow-Ups Management ──────────────────────────────────

export function getFollowUps(filter?: { clientId?: string; status?: FollowUpStatus }): ClientFollowUp[] {
  const raw = safeGetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.FOLLOW_UPS);
  if (!raw) return [];

  try {
    const list: unknown = JSON.parse(raw);
    if (!Array.isArray(list)) return [];
    let result = list as ClientFollowUp[];

    if (filter?.clientId) {
      result = result.filter(item => item.clientId === filter.clientId);
    }
    if (filter?.status) {
      result = result.filter(item => item.status === filter.status);
    }

    return result;
  } catch (e) {
    console.warn('[ClientCommunication] Error reading follow-ups:', e);
    return [];
  }
}

export function saveFollowUp(
  item: Omit<ClientFollowUp, 'id' | 'createdAt'> & { id?: string }
): ClientFollowUp {
  const all = getFollowUps();
  const now = new Date().toISOString();

  if (item.id) {
    const existingIndex = all.findIndex(f => f.id === item.id);
    if (existingIndex >= 0) {
      const updatedItem: ClientFollowUp = {
        ...all[existingIndex],
        ...item,
        updatedAt: now,
      };
      all[existingIndex] = updatedItem;
      safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(all));
      return updatedItem;
    }
  }

  const newItem: ClientFollowUp = {
    ...item,
    id: item.id || `fu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: now,
    updatedAt: now,
  };

  const updatedList = [newItem, ...all];
  safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(updatedList));
  return newItem;
}

export function updateFollowUpStatus(id: string, status: FollowUpStatus): void {
  const all = getFollowUps();
  const target = all.find(item => item.id === id);
  if (!target) return;

  target.status = status;
  target.updatedAt = new Date().toISOString();
  safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(all));
}

export function deleteFollowUp(id: string): void {
  const all = getFollowUps();
  const filtered = all.filter(item => item.id !== id);
  safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.FOLLOW_UPS, JSON.stringify(filtered));
}

// ── 3. Reminder Deduplication Index ───────────────────────────

export function getSentReminderKeys(): string[] {
  const raw = safeGetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.SENT_REMINDERS_INDEX);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
}

export function markReminderSent(reminderKey: string): void {
  if (!reminderKey) return;
  const current = getSentReminderKeys();
  if (!current.includes(reminderKey)) {
    const updated = [...current, reminderKey];
    safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.SENT_REMINDERS_INDEX, JSON.stringify(updated));
  }
}

export function clearSentReminderKeys(): void {
  safeSetItem(CLIENT_COMMUNICATION_STORAGE_KEYS.SENT_REMINDERS_INDEX, JSON.stringify([]));
}

// ── 4. Unified Communication Templates ─────────────────────────

export async function getAllCommunicationTemplates(
  userProfile?: Profile | null
): Promise<CommunicationTemplate[]> {
  try {
    // 1. Ambil template offline dari profil pengguna jika ada
    const customChatTemplates = await getChatTemplatesOffline(userProfile || undefined);

    const mappedCustom: CommunicationTemplate[] = (customChatTemplates || []).map(t => ({
      id: t.id,
      title: t.title,
      category: 'custom',
      template: t.template,
      variables: [] as string[],
      isDefault: false,
    }));

    // Gabungkan dengan template bawaan sistem (hindari duplikasi berdasarkan ID)
    const customIds = new Set(mappedCustom.map(c => c.id));
    const defaults = DEFAULT_COMMUNICATION_TEMPLATES.filter(d => !customIds.has(d.id));

    return [...defaults, ...mappedCustom];
  } catch (error) {
    console.warn('[ClientCommunication] Error loading templates, fallback to defaults:', error);
    return DEFAULT_COMMUNICATION_TEMPLATES;
  }
}
