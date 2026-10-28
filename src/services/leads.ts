import { Lead, LeadStatus, ContactChannel } from '../types';
import { apiRequest } from './apiClient';

type LeadFilters = {
  search?: string;
  source?: string;
  city?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  activeOnly?: boolean;
  eventMonth?: { from: string; to: string };
};

type LeadPage = { leads: Record<string, unknown>[]; total: number };

export async function listLeads(options: { limit?: number; offset?: number } = {}): Promise<Lead[]> {
  const limit = Math.min(100, Math.max(1, Math.floor(options.limit ?? 100)));
  const offset = Math.max(0, Math.floor(options.offset || 0));
  const query = new URLSearchParams({ limit: String(limit), offset: String(offset) });
  const result = await apiRequest<LeadPage>(`/leads?${query}`);
  return result.leads.map(normalizeLead);
}

export async function listLeadsPaginated(
  page = 1,
  pageSize = 10,
  filters: LeadFilters = {},
): Promise<{ leads: Lead[]; total: number; hasMore: boolean }> {
  const size = [10, 20, 50].includes(pageSize) ? pageSize : 10;
  const safePage = Math.max(1, Math.floor(page) || 1);
  const query = new URLSearchParams({ page: String(safePage), limit: String(size) });
  if (filters.search?.trim()) query.set('search', filters.search.trim());
  if (filters.source) query.set('source', filters.source);
  if (filters.city) query.set('city', filters.city);
  if (filters.dateFrom) query.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) query.set('dateTo', filters.dateTo);
  if (filters.status) query.set('status', filters.status);
  if (filters.activeOnly) query.set('activeOnly', 'true');
  if (filters.eventMonth) {
    query.set('eventDateFrom', filters.eventMonth.from);
    query.set('eventDateTo', filters.eventMonth.to);
  }
  const result = await apiRequest<LeadPage>(`/leads?${query}`);
  const leads = result.leads.map(normalizeLead);
  return { leads, total: result.total, hasMore: safePage * size < result.total };
}

export async function createLead(payload: Omit<Lead, 'id'>): Promise<Lead> {
  const row = await apiRequest<Record<string, unknown>>('/leads', {
    method: 'POST',
    body: JSON.stringify(toApiLead(payload)),
  });
  return normalizeLead(row);
}

export async function createPublicLead(profileId: string, payload: Omit<Lead, 'id'>): Promise<Lead> {
  const row = await apiRequest<Record<string, unknown>>(`/leads/public/${encodeURIComponent(profileId)}`, {
    method: 'POST',
    body: JSON.stringify(toApiLead(payload)),
  });
  return normalizeLead(row);
}

export async function updateLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  const row = await apiRequest<Record<string, unknown>>(`/leads/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(toApiLead(patch)),
  });
  return normalizeLead(row);
}

export async function deleteLead(id: string): Promise<void> {
  await apiRequest<void>(`/leads/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

function toApiLead(lead: Partial<Lead>) {
  const status = lead.status === LeadStatus.DISCUSSION ? 'contacted'
    : lead.status === LeadStatus.FOLLOW_UP ? 'follow_up'
      : lead.status === LeadStatus.CONVERTED ? 'deal'
        : lead.status === LeadStatus.REJECTED ? 'lost' : undefined;
  return {
    ...(lead.name !== undefined && { name: lead.name }),
    ...(lead.contactChannel !== undefined && { contactChannel: lead.contactChannel }),
    ...(lead.location !== undefined && { location: lead.location }),
    ...(lead.date !== undefined && { date: lead.date }),
    ...(lead.notes !== undefined && { notes: lead.notes }),
    ...(lead.whatsapp !== undefined && { whatsapp: lead.whatsapp, phone: lead.whatsapp }),
    ...(lead.address !== undefined && { address: lead.address }),
    ...(lead.eventDate !== undefined && { eventDate: lead.eventDate }),
    ...(status && { status }),
  };
}

function normalizeLeadStatus(status: unknown): LeadStatus {
  const value = typeof status === 'string' ? status.trim() : '';
  switch (value.toLowerCase().replace(/[_-]+/g, ' ')) {
    case 'discussion':
    case 'contacted':
    case 'meeting scheduled':
    case 'sedang diskusi': return LeadStatus.DISCUSSION;
    case 'follow up':
    case 'followup':
    case 'menunggu follow up': return LeadStatus.FOLLOW_UP;
    case 'converted':
    case 'deal':
    case 'dikonversi': return LeadStatus.CONVERTED;
    case 'rejected':
    case 'lost':
    case 'ditolak': return LeadStatus.REJECTED;
    default: return value as LeadStatus;
  }
}

export function normalizeLead(row: any): Lead {
  return {
    id: row.id,
    name: row.name ?? [row.groomName, row.brideName].filter(Boolean).join(' & '),
    contactChannel: (row.contactChannel ?? row.contact_channel) as ContactChannel,
    location: row.location ?? row.eventLocation ?? row.event_location ?? '',
    status: normalizeLeadStatus(row.status),
    date: row.date ?? row.contactDate ?? row.contact_date ?? row.createdAt ?? row.created_at,
    notes: row.notes ?? undefined,
    whatsapp: row.whatsapp ?? row.phone ?? undefined,
    address: row.address ?? undefined,
    eventDate: row.eventDate ?? row.event_date ?? undefined,
    createdAt: row.createdAt ?? row.created_at ?? row.date,
    updatedAt: row.updatedAt ?? row.updated_at ?? undefined,
  };
}
