import { ClientInteractionLog } from '../types';

/**
 * Memastikan log interaksi hanya memuat data milik clientId tertentu.
 * Menjamin isolasi data antar klien tanpa risiko data tercampur.
 */
export function filterInteractionsForClient(
  logs: ClientInteractionLog[],
  clientId: string
): ClientInteractionLog[] {
  if (!clientId || !Array.isArray(logs)) return [];
  return logs.filter(log => log.clientId === clientId);
}

/**
 * Memvalidasi apakah sebuah log memiliki clientId yang valid dan cocok
 */
export function assertClientLogIntegrity(
  log: ClientInteractionLog,
  expectedClientId: string
): boolean {
  return Boolean(
    log &&
    log.clientId &&
    log.clientId === expectedClientId &&
    typeof log.message === 'string' &&
    typeof log.timestamp === 'string'
  );
}
