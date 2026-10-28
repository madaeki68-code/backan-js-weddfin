/**
 * Standardized Phone and WhatsApp Number Normalization and Formatting
 */

/**
 * Normalizes phone numbers to standard WhatsApp format (digits only, e.g., 6281234567890)
 */
export function normalizeWhatsAppNumber(phone: string | null | undefined): string {
  if (!phone) return '';

  let digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // Remove leading 00 international prefix
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // Indonesian local mobile format: 08xx -> 628xx
  if (digits.startsWith('0')) {
    digits = '62' + digits.slice(1);
  } else if (digits.startsWith('8') && digits.length >= 9) {
    digits = '62' + digits;
  }

  return digits;
}

/**
 * Format phone number for clean readable display in UI
 * e.g., "6281234567890" -> "+62 812-3456-7890"
 */
export function formatDisplayPhoneNumber(phone: string | null | undefined): string {
  const normalized = normalizeWhatsAppNumber(phone);
  if (!normalized) return '-';

  if (normalized.startsWith('62') && normalized.length >= 10) {
    const prefix = '+62';
    const part1 = normalized.slice(2, 5);
    const part2 = normalized.slice(5, 9);
    const part3 = normalized.slice(9);
    return `${prefix} ${part1}-${part2}${part3 ? `-${part3}` : ''}`;
  }

  return `+${normalized}`;
}

/**
 * Check if the number is a valid mobile/WhatsApp number (at least 9 digits)
 */
export function isValidWhatsAppNumber(phone: string | null | undefined): boolean {
  const normalized = normalizeWhatsAppNumber(phone);
  return normalized.length >= 9 && normalized.length <= 16;
}

/**
 * Backward-compatible helper for legacy call sites
 */
export function cleanPhoneNumber(phone: string | undefined | null): string {
  return normalizeWhatsAppNumber(phone);
}

/**
 * Build standard WhatsApp click-to-chat URL
 */
export function buildWhatsAppChatUrl(phone: string | null | undefined, text = ''): string {
  const cleanPhone = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text || '');

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
