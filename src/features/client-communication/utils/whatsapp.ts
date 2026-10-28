import { normalizeWhatsAppNumber } from './phone';

/**
 * Membangun URL tautan WhatsApp Web / API click-to-chat
 * @param phone Nomor telepon tujuan (bisa kosong jika ingin membagikan pesan umum)
 * @param text Pesan yang akan dikirim (otomatis di-URI-encode)
 */
export function buildWhatsAppLink(phone: string | null | undefined, text: string): string {
  const cleanPhone = normalizeWhatsAppNumber(phone);
  const encodedText = encodeURIComponent(text || '');

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  // Jika tanpa nomor spesifik (pengguna memilih kontak di WhatsApp)
  return `https://wa.me/?text=${encodedText}`;
}

/**
 * Membuka chat WhatsApp di jendela atau tab baru secara aman
 * @returns boolean true jika browser berhasil membuka window
 */
export function openWhatsAppChat(
  phone: string | null | undefined,
  text: string,
  target: '_blank' | '_self' = '_blank'
): boolean {
  try {
    const url = buildWhatsAppLink(phone, text);
    if (typeof window !== 'undefined') {
      const opened = window.open(url, target, 'noopener,noreferrer');
      return Boolean(opened);
    }
    return false;
  } catch (error) {
    console.error('[WhatsAppUtils] Failed to open WhatsApp window:', error);
    return false;
  }
}
