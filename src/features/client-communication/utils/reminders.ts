import { Client, Project, Lead, LeadStatus } from '../../../types';
import { ClientReminder, ReminderType } from '../types';
import { formatCurrency } from '../../../utils/currency';

/**
 * Membuat kunci pengingat deterministik untuk mencegah peringatan ganda (deduplication)
 */
export function generateReminderKey(type: ReminderType, entityId: string, referenceDate: string): string {
  const cleanDate = (referenceDate || '').slice(0, 10);
  return `rem_${type}_${entityId}_${cleanDate}`;
}

/**
 * Memeriksa apakah pengingat sudah pernah tercatat terkirim
 */
export function isReminderAlreadySent(key: string, sentKeys: string[] | Set<string>): boolean {
  if (sentKeys instanceof Set) {
    return sentKeys.has(key);
  }
  return sentKeys.includes(key);
}

/**
 * Menghitung daftar pengingat relevan yang perlu ditindaklanjuti dari data clients, projects, dan leads
 */
export function computeClientReminders(
  clients: Client[],
  projects: Project[],
  leads: Lead[] = [],
  options: {
    sentReminderKeys?: string[];
    maxDaysAhead?: number;
    referenceDate?: Date;
  } = {}
): ClientReminder[] {
  const {
    sentReminderKeys = [],
    maxDaysAhead = 14,
    referenceDate = new Date(),
  } = options;

  const reminders: ClientReminder[] = [];
  const sentSet = new Set(sentReminderKeys);
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);

  // 1. Pengingat Pembayaran Proyek yang belum lunas
  for (const project of projects) {
    const remaining = (project.totalCost || 0) - (project.amountPaid || 0);
    if (remaining <= 0) continue;

    const client = clients.find(c => c.id === project.clientId);
    const clientName = client?.name || project.clientName || 'Klien';
    const clientPhone = client?.whatsapp || client?.phone;

    // Prioritaskan deadlineDate, atau fallback ke tanggal acara
    const targetDateStr = project.deadlineDate || project.date;
    if (!targetDateStr) continue;

    const targetDate = new Date(targetDateStr);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Masuk daftar pengingat jika jatuh tempo dalam rentang maxDaysAhead atau sudah terlewat (overdue)
    if (diffDays <= maxDaysAhead) {
      const key = generateReminderKey('payment_due', project.id, targetDateStr);
      const isSent = sentSet.has(key);

      const isOverdue = diffDays < 0;
      const formattedRemaining = formatCurrency(remaining);
      const suggestedMessage = isOverdue
        ? `Halo Kak ${clientName}, sisa pembayaran untuk acara "${project.projectName}" sebesar ${formattedRemaining} telah melewati batas jatuh tempo. Mohon kesediaannya untuk segera menyelesaikan pembayaran. Terima kasih!`
        : `Halo Kak ${clientName}, ini pengingat ramah bahwa sisa pembayaran acara "${project.projectName}" sebesar ${formattedRemaining} akan jatuh tempo dalam ${diffDays} hari. Terima kasih!`;

      reminders.push({
        id: key,
        clientId: client?.id || project.clientId,
        clientName,
        projectId: project.id,
        projectName: project.projectName,
        type: 'payment_due',
        dueDate: targetDateStr,
        daysRemaining: diffDays,
        isOverdue,
        suggestedMessage,
        targetPhone: clientPhone,
        amountDue: remaining,
        sentAt: isSent ? 'Terkirim' : undefined,
      });
    }
  }

  // 2. Pengingat Acara Pernikahan Mendekati Hari H (<= 7 hari)
  for (const project of projects) {
    if (!project.date) continue;
    const targetDate = new Date(project.date);
    targetDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 0 && diffDays <= 7) {
      const client = clients.find(c => c.id === project.clientId);
      const clientName = client?.name || project.clientName || 'Klien';
      const clientPhone = client?.whatsapp || client?.phone;
      const key = generateReminderKey('wedding_upcoming', project.id, project.date);
      const isSent = sentSet.has(key);

      const suggestedMessage = diffDays === 0
        ? `Selamat pagi Kak ${clientName}! Hari ini adalah hari bahagia acara "${project.projectName}". Seluruh tim kami siap mendampingi dan memberikan yang terbaik!`
        : `Halo Kak ${clientName}, acara "${project.projectName}" akan berlangsung ${diffDays} hari lagi (${new Date(project.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}). Pastikan seluruh persiapan teknis dan koordinasi sudah siap ya Kak!`;

      reminders.push({
        id: key,
        clientId: client?.id || project.clientId,
        clientName,
        projectId: project.id,
        projectName: project.projectName,
        type: 'wedding_upcoming',
        dueDate: project.date,
        daysRemaining: diffDays,
        isOverdue: false,
        suggestedMessage,
        targetPhone: clientPhone,
        sentAt: isSent ? 'Terkirim' : undefined,
      });
    }
  }

  // 3. Pengingat Follow Up Calon Pengantin (Leads)
  for (const lead of leads) {
    if (lead.status === LeadStatus.FOLLOW_UP) {
      const leadDateStr = lead.date || new Date().toISOString();
      const key = generateReminderKey('lead_followup', lead.id, leadDateStr);
      const isSent = sentSet.has(key);

      reminders.push({
        id: key,
        clientId: lead.id,
        clientName: lead.name,
        leadId: lead.id,
        type: 'lead_followup',
        dueDate: leadDateStr,
        daysRemaining: 0,
        isOverdue: false,
        suggestedMessage: `Halo Kak ${lead.name}, kami ingin follow up kembali terkait rencana pernikahan Kakak. Apakah ada informasi atau penyesuaian paket yang bisa kami bantu?`,
        targetPhone: lead.whatsapp,
        sentAt: isSent ? 'Terkirim' : undefined,
      });
    }
  }

  // Urutkan pengingat: yang overdue atau paling mendesak terlebih dahulu
  return reminders.sort((a, b) => a.daysRemaining - b.daysRemaining);
}
