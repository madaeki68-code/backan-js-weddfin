/**
 * Utility functions for formatting business settings data
 */

export function formatSocialHandle(input?: string): string {
  if (!input) return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
}

export function formatBankAccountDisplay(bankAccount?: string): string {
  if (!bankAccount) return 'Belum diatur';
  return bankAccount.trim();
}

export function formatPhoneDisplay(phone?: string): string {
  if (!phone) return '-';
  return phone.trim();
}
