import { CommunicationTemplate, MessageTemplateCategory } from '../types';

export const CLIENT_COMMUNICATION_STORAGE_KEYS = {
  INTERACTIONS_PREFIX: 'vena_client_interactions_',
  FOLLOW_UPS: 'vena_client_followups_v1',
  SENT_REMINDERS_INDEX: 'vena_client_sent_reminders_index_v1',
} as const;

export const TEMPLATE_CATEGORY_LABELS: Record<MessageTemplateCategory, string> = {
  lead_initial: 'Calon Pengantin (Awal)',
  lead_followup: 'Follow Up Calon Pengantin',
  payment_reminder: 'Pengingat Pembayaran',
  event_reminder: 'Pengingat Acara Pernikahan',
  progress_update: 'Update Progres Acara',
  confirmation: 'Konfirmasi Jadwal & Layanan',
  custom: 'Kustom',
};

export const DEFAULT_COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  // ── Leads Initial ──────────────────────────────────────────
  {
    id: 'lead_welcome_catalog',
    title: 'Kirim Brosur / Katalog Paket',
    category: 'lead_initial',
    template: `Halo Kak {clientName}! 👋

Terima kasih sudah menghubungi {companyName}. Kami sangat senang bisa berkesempatan menjadi bagian dari hari bahagia Kakak.

Berikut tautan katalog paket dan portofolio layanan kami:
{packageLink}

Silakan dilihat-lihat terlebih dahulu ya Kak. Jika ada hal yang ingin ditanyakan atau dikonsultasikan, jangan ragu untuk beritahu kami.

Salam hangat,
*{companyName}*`,
    variables: ['clientName', 'companyName', 'packageLink'],
    description: 'Menyapa lead baru dan mengirim tautan katalog paket',
    isDefault: true,
  },
  {
    id: 'lead_booking_form',
    title: 'Undangan Isi Form Booking',
    category: 'lead_initial',
    template: `Halo Kak {clientName}! 👋

Terima kasih atas minat dan kepercayaannya kepada {companyName}.

Untuk memastikan ketersediaan tanggal dan memproses jadwal acara Kakak, silakan lengkapi formulir booking melalui tautan berikut:
{bookingFormLink}

Setelah formulir dikirim, tim kami akan segera menghubungi Kakak untuk konfirmasi dan langkah selanjutnya.

Salam hangat,
*{companyName}*`,
    variables: ['clientName', 'companyName', 'bookingFormLink'],
    description: 'Mengirim form reservasi/booking resmi ke calon pengantin',
    isDefault: true,
  },

  // ── Leads Follow-up ─────────────────────────────────────────
  {
    id: 'lead_friendly_followup',
    title: 'Follow Up Penawaran & Paket',
    category: 'lead_followup',
    template: `Halo Kak {clientName}! Semoga kabarnya selalu sehat dan bahagia. 😊

Kami dari tim *{companyName}* ingin menyapa kembali terkait rencana acara pernikahan Kakak. Apakah sudah sempat melihat penawaran paket yang kami kirimkan?

Jika butuh penyesuaian paket sesuai anggaran atau konsep acara, kami siap berdiskusi dan membantu mencarikan opsi terbaik untuk Kakak.

Terima kasih Kak! 🙏`,
    variables: ['clientName', 'companyName'],
    description: 'Menyapa kembali lead yang sedang berdiskusi atau menunggu kepastian',
    isDefault: true,
  },

  // ── Payment Reminders ───────────────────────────────────────
  {
    id: 'payment_friendly_reminder',
    title: 'Pengingat Pembayaran Ramah',
    category: 'payment_reminder',
    template: `Halo Kak {clientName}, semoga sehat selalu! 🙏

Kami ingin menginformasikan perihal sisa pembayaran untuk acara pernikahan *{projectName}*.

📋 *Rincian Tagihan:*
• Total Biaya: {totalCost}
• Sudah Terbayar: {amountPaid}
• Sisa Pembayaran: *{sisaTagihan}*

💳 *Tujuan Transfer:*
{bankAccount}

🔗 Detail invoice dan riwayat pembayaran dapat diakses melalui Portal Pengantin:
{portalLink}

Mohon konfirmasinya jika transfer telah dilakukan. Terima kasih atas kerja samanya!

Salam,
*{companyName}*`,
    variables: ['clientName', 'projectName', 'totalCost', 'amountPaid', 'sisaTagihan', 'bankAccount', 'portalLink', 'companyName'],
    description: 'Pengingat pembayaran ramah dengan rincian rekening dan portal',
    isDefault: true,
  },
  {
    id: 'payment_due_date',
    title: 'Pengingat Jatuh Tempo Pembayaran',
    category: 'payment_reminder',
    template: `Yth. Kak {clientName},

Menurut catatan administrasi kami, sisa pembayaran untuk acara *{projectName}* akan segera jatuh tempo ({dueDate}).

📋 *Rincian:*
• Sisa Tagihan: *{sisaTagihan}*
• Rekening Pembayaran: {bankAccount}

Untuk memeriksa rincian lengkap invoice, silakan buka Portal Pengantin Kakak:
{portalLink}

Kami mohon kesediaan Kakak untuk menyelesaikan pembayaran sebelum tanggal jatuh tempo agar persiapan operasional dapat berjalan lancar. Terima kasih banyak atas pengertiannya. 🙏

Hormat kami,
*{companyName}*`,
    variables: ['clientName', 'projectName', 'dueDate', 'sisaTagihan', 'bankAccount', 'portalLink', 'companyName'],
    description: 'Pengingat mendekati tanggal jatuh tempo',
    isDefault: true,
  },

  // ── Event Reminders & Preparation ───────────────────────────
  {
    id: 'event_upcoming_reminder',
    title: 'Pengingat Hari H & Persiapan Acara',
    category: 'event_reminder',
    template: `Halo Kak {clientName}! 💍✨

Mengingatkan bahwa hari bahagia Kakak untuk acara *{projectName}* semakin dekat:
📅 Tanggal: *{eventDate}*
⏰ Waktu: {eventTime}
📍 Lokasi: {location}

Seluruh tim *{companyName}* telah bersiap memberikan yang terbaik untuk momen istimewa Kakak. Jika ada koordinasi tambahan atau perubahan susunan rundown, silakan beritahu kami ya Kak.

Semoga seluruh persiapan lancar sampai hari H! 💖`,
    variables: ['clientName', 'projectName', 'eventDate', 'eventTime', 'location', 'companyName'],
    description: 'Pengingat H-3 / H-1 menjelang acara pernikahan',
    isDefault: true,
  },
  {
    id: 'event_schedule_confirmation',
    title: 'Konfirmasi Jadwal & Lokasi Acara',
    category: 'confirmation',
    template: `Halo Kak {clientName},

Kami ingin mengonfirmasi ulang jadwal dan lokasi acara *{projectName}*:

• Acara: *{projectName}*
• Paket: {packageName}
• Tanggal: {eventDate}
• Jam Pelaksanaan: {eventTime}
• Lokasi / Venue: {location}

Mohon dicek kembali, jika ada ketidaksesuaian mohon segera informasikan ke tim kami. Terima kasih!

Salam hangat,
*{companyName}*`,
    variables: ['clientName', 'projectName', 'packageName', 'eventDate', 'eventTime', 'location', 'companyName'],
    description: 'Konfirmasi jadwal, jam kerja, dan lokasi acara',
    isDefault: true,
  },

  // ── Progress Update & Completion ─────────────────────────────
  {
    id: 'progress_update',
    title: 'Update Progres Acara & Portal',
    category: 'progress_update',
    template: `Halo Kak {clientName}! 👋

Berikut pembaruan progres persiapan untuk acara *{projectName}*:
• Status Terkini: *{currentStatus}*
• Progres: {progressPercentage}%

Kakak dapat memantau detail linimasa, status vendor, dan kelengkapan administrasi melalui Portal Pengantin di sini:
{portalLink}

Jika ada pertanyaan atau permintaan khusus, silakan hubungi kami. Terima kasih!

Salam,
*{companyName}*`,
    variables: ['clientName', 'projectName', 'currentStatus', 'progressPercentage', 'portalLink', 'companyName'],
    description: 'Update status progres acara ke pengantin',
    isDefault: true,
  },
  {
    id: 'post_event_delivery',
    title: 'Serah Terima Hasil & Ucapan Terima Kasih',
    category: 'progress_update',
    template: `Halo Kak {clientName}! 🌸

Terima kasih banyak telah mempercayakan momen bersejarah Kakak kepada kami di acara *{projectName}*.

Hasil dokumentasi dan berkas acara Kakak sudah siap diakses melalui tautan berikut:
{downloadLink}

Silakan dicek dan disimpan ya Kak. Jika ada hal yang ingin direview atau ditanyakan, kami siap membantu dalam 7 hari kerja ke depan.

Sekali lagi selamat dan sukses selalu untuk Kakak dan keluarga tercinta! 🙏✨

Hormat kami,
*{companyName}*`,
    variables: ['clientName', 'projectName', 'downloadLink', 'companyName'],
    description: 'Pengiriman hasil kerja atau tautan Google Drive pasca-acara',
    isDefault: true,
  },
];
