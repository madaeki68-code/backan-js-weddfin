import {
  normalizeWhatsAppNumber,
  buildWhatsAppChatUrl,
  formatDisplayPhoneNumber,
  isValidWhatsAppNumber,
  cleanPhoneNumber,
} from './phone';

export { normalizeWhatsAppNumber, formatDisplayPhoneNumber, isValidWhatsAppNumber, cleanPhoneNumber };

export function generateWhatsAppLink(phone: string | undefined | null, text: string): string {
  const cleanPhone = normalizeWhatsAppNumber(phone);
  if (!cleanPhone) return '#';
  return buildWhatsAppChatUrl(cleanPhone, text);
}
