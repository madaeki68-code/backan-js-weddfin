import { CommunicationContextData } from '../types';
import { formatCurrency, formatIdNumber } from '../../../utils/currency';
import { toPublicNameSlug } from '../../../utils/publicRouting';

/**
 * Mengganti variabel dalam template teks dengan nilai dari dictionary variabel
 * Contoh: "Halo {clientName}" dengan { clientName: "Budi" } -> "Halo Budi"
 */
export function interpolateTemplate(
  template: string,
  variables: Record<string, string | number | undefined | null>
): string {
  if (!template) return '';

  let result = template;
  for (const [key, rawValue] of Object.entries(variables)) {
    const value = rawValue !== undefined && rawValue !== null ? String(rawValue) : '';
    const regex = new RegExp(`\\{\\{?${key}\\}\\}?`, 'g');
    result = result.replace(regex, () => value);
  }

  return result;
}

/**
 * Mengekstrak daftar nama placeholder yang ada di dalam template
 * Contoh: "Halo {clientName}, acara {projectName}" -> ['clientName', 'projectName']
 */
export function extractTemplateVariables(template: string): string[] {
  if (!template) return [];
  const matches = template.match(/\{([a-zA-Z0-9_]+)\}/g);
  if (!matches) return [];

  const unique = new Set(matches.map(m => m.slice(1, -1)));
  return Array.from(unique);
}

/**
 * Membangun variabel kontekstual lengkap berdasarkan data Client, Project, Lead, dan Profile
 * Menjamin tidak ada hardcoded nama vendor atau rekening palsu.
 */
export function buildContextVariables(context: CommunicationContextData): Record<string, string> {
  const { client, project, lead, profile } = context;

  const clientName = client?.name || lead?.name || 'Klien Kami';
  const companyName = profile?.companyName || profile?.fullName || 'Tim Kami';
  const bankAccount = profile?.bankAccount || 'Rekening Vendor Resmi';

  // Format link portal
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const pathname = typeof window !== 'undefined' ? window.location.pathname.replace(/index\.html$/, '') : '';
  const portalBase = `${origin}${pathname}#/portal/`;
  const portalLink = clientName ? `${portalBase}${toPublicNameSlug(clientName)}` : portalBase;

  // Format link paket & formulir booking publik
  const packageLink = `${origin}${pathname}#/public-packages`;
  const bookingFormLink = `${origin}${pathname}#/public-booking`;

  // Project details
  const projectName = project?.projectName || (lead ? `Acara ${lead.name}` : 'Acara Pernikahan');
  const packageName = project?.packageName || '-';
  const location = project?.location || lead?.location || 'Venue Acara';

  const totalCostNum = project?.totalCost ?? 0;
  const amountPaidNum = project?.amountPaid ?? 0;
  const remainingNum = Math.max(0, totalCostNum - amountPaidNum);

  const totalCost = formatCurrency(totalCostNum);
  const amountPaid = formatCurrency(amountPaidNum);
  const sisaTagihan = formatCurrency(remainingNum);

  // Format tanggal acara
  let eventDate = 'Tanggal Acara';
  const rawDate = project?.date || lead?.eventDate;
  if (rawDate) {
    try {
      eventDate = new Date(rawDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      eventDate = rawDate;
    }
  }

  // Format jatuh tempo
  let dueDate = 'Sesuai Kesepakatan';
  if (project?.deadlineDate) {
    try {
      dueDate = new Date(project.deadlineDate).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      dueDate = project.deadlineDate;
    }
  }

  const eventTime = project?.startTime ? `${project.startTime}${project.endTime ? ` - ${project.endTime}` : ''}` : 'Sesuai Jadwal';
  const currentStatus = project?.status || (lead?.status ? `Status Lead: ${lead.status}` : 'Dalam Proses');
  const progressPercentage = String(project?.progress ?? 0);
  const downloadLink = project?.finalDriveLink || project?.clientDriveLink || project?.driveLink || '[Tautan Drive akan dibagikan]';

  return {
    clientName,
    companyName,
    bankAccount,
    portalLink,
    packageLink,
    bookingFormLink,
    projectName,
    packageName,
    location,
    totalCost,
    amountPaid,
    sisaTagihan,
    remainingAmount: sisaTagihan, // Alias compatibility
    totalDue: sisaTagihan,        // Alias compatibility
    eventDate,
    dueDate,
    eventTime,
    currentStatus,
    progressPercentage,
    downloadLink,
    leadName: clientName,        // Alias for lead templates
  };
}
