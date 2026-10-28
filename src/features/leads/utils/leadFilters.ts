import {
  Lead,
  LeadStatus,
  ContactChannel,
} from '../../../types';
import type {
  LeadCardFilter,
  LeadCityStats,
  LeadEventMonthStats,
  LeadFilterCriteria,
  LeadSourceStats,
  LeadStatsSummary,
} from '../types/leads.types';

export const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export const filterLeads = (
  leads: Lead[],
  criteria: LeadFilterCriteria
): Lead[] => {
  const { searchTerm, sourceFilter, cityFilter, dateFrom, dateTo, activeCardFilter } = criteria;
  const term = searchTerm.trim().toLowerCase();

  const from = dateFrom ? new Date(dateFrom) : null;
  const to = dateTo ? new Date(dateTo) : null;
  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);

  return leads.filter((lead) => {
    const searchMatch =
      term === '' ||
      lead.name.toLowerCase().includes(term) ||
      Boolean(lead.notes && lead.notes.toLowerCase().includes(term)) ||
      Boolean(lead.location && lead.location.toLowerCase().includes(term));

    const sourceMatch = sourceFilter === 'all' || lead.contactChannel === sourceFilter;
    const cityMatch =
      cityFilter === 'all' ||
      Boolean(lead.location && lead.location.trim().toLowerCase() === cityFilter.toLowerCase());

    const leadDate = new Date(lead.date);
    const dateMatch = (!from || leadDate >= from) && (!to || leadDate <= to);

    if (!searchMatch || !sourceMatch || !cityMatch || !dateMatch) return false;

    if (activeCardFilter) {
      if (activeCardFilter.type === 'city' && activeCardFilter.value) {
        const loc = (lead.location || '').trim().toLowerCase();
        if (loc !== activeCardFilter.value.toLowerCase()) return false;
      } else if (activeCardFilter.type === 'event_month' && activeCardFilter.value) {
        if (!lead.eventDate) return false;
        const d = new Date(lead.eventDate);
        if (isNaN(d.getTime())) return false;
        const m = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        if (m.toLowerCase() !== activeCardFilter.value.toLowerCase()) return false;
      } else if (activeCardFilter.type === 'source' && activeCardFilter.value) {
        if (lead.contactChannel !== activeCardFilter.value) return false;
      } else if (activeCardFilter.type === 'active') {
        if (lead.status !== LeadStatus.DISCUSSION && lead.status !== LeadStatus.FOLLOW_UP) return false;
      } else if (activeCardFilter.type === 'converted') {
        if (lead.status !== LeadStatus.CONVERTED) return false;
      }
    }

    return true;
  });
};

export const computeLeadStatsSummary = (leads: Lead[]): LeadStatsSummary => {
  const totalLeads = leads.length;
  const activeLeads = leads.filter(
    (l) => l.status === LeadStatus.DISCUSSION || l.status === LeadStatus.FOLLOW_UP
  ).length;
  const discussionLeads = leads.filter((l) => l.status === LeadStatus.DISCUSSION).length;
  const followUpLeads = leads.filter((l) => l.status === LeadStatus.FOLLOW_UP).length;
  const convertedLeads = leads.filter((l) => l.status === LeadStatus.CONVERTED).length;
  const rejectedLeads = leads.filter((l) => l.status === LeadStatus.REJECTED).length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newThisMonth = leads.filter((l) => l.date && new Date(l.date) >= startOfMonth).length;

  return {
    totalLeads,
    activeLeads,
    discussionLeads,
    followUpLeads,
    convertedLeads,
    rejectedLeads,
    conversionRate,
    newThisMonth,
  };
};

export const computeCityStats = (leads: Lead[]): LeadCityStats => {
  const map = new Map<string, number>();
  leads.forEach((l) => {
    const c = (l.location || '').trim();
    if (c) map.set(c, (map.get(c) || 0) + 1);
  });
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  return {
    topCity: top ? top[0] : leads.length > 0 ? 'Belum Diisi' : '-',
    topCount: top ? top[1] : 0,
    hasData: Boolean(top),
    ranking: sorted,
  };
};

export const computeEventMonthStats = (leads: Lead[]): LeadEventMonthStats => {
  const map = new Map<string, number>();
  let withDateCount = 0;
  leads.forEach((l) => {
    if (l.eventDate) {
      withDateCount++;
      const d = new Date(l.eventDate);
      if (!isNaN(d.getTime())) {
        const key = d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
        map.set(key, (map.get(key) || 0) + 1);
      }
    }
  });
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  return {
    topMonth: top ? top[0] : withDateCount > 0 ? 'Ada Jadwal' : '-',
    topCount: top ? top[1] : 0,
    withDateCount,
    hasData: Boolean(top),
    ranking: sorted,
  };
};

export const computeSourceStats = (leads: Lead[]): LeadSourceStats => {
  const map = new Map<ContactChannel, number>();
  leads.forEach((l) => {
    const ch = l.contactChannel || ContactChannel.OTHER;
    map.set(ch, (map.get(ch) || 0) + 1);
  });
  const sorted = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];
  return {
    topSource: top ? top[0] : ContactChannel.OTHER,
    topCount: top ? top[1] : 0,
    hasData: Boolean(top),
    ranking: sorted,
  };
};

export const groupLeadsByStatus = (leads: Lead[]): Record<LeadStatus, Lead[]> => {
  const columns: Record<LeadStatus, Lead[]> = {
    [LeadStatus.DISCUSSION]: [],
    [LeadStatus.FOLLOW_UP]: [],
    [LeadStatus.CONVERTED]: [],
    [LeadStatus.REJECTED]: [],
  };
  leads.forEach((lead) => {
    if (columns[lead.status]) {
      columns[lead.status].push(lead);
    }
  });
  return columns;
};

export const computeLeadStats = computeLeadStatsSummary;
