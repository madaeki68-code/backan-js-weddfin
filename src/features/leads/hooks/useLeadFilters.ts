import { useState, useMemo, useEffect } from 'react';
import { Lead, LeadStatus, ContactChannel, Profile } from '../../../types';
import type { LeadCardFilter, LeadViewMode } from '../types/leads.types';
import { filterLeads } from '../utils/leadFilters';

export interface UseLeadFiltersProps {
  leads: Lead[];
  userProfile: Profile;
}

export function useLeadFilters({ leads, userProfile }: UseLeadFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState<ContactChannel | 'all'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [activeCardFilter, setActiveCardFilter] = useState<LeadCardFilter | null>(null);
  const [viewMode, setViewMode] = useState<LeadViewMode>('kanban');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobileStatusTab, setMobileStatusTab] = useState<'all' | LeadStatus>('all');
  const [hiddenColumns, setHiddenColumns] = useState<Set<LeadStatus>>(new Set());

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const activeLeadFilterCount =
    (sourceFilter !== 'all' ? 1 : 0) +
    (cityFilter !== 'all' ? 1 : 0) +
    (dateFrom ? 1 : 0) +
    (dateTo ? 1 : 0) +
    (activeCardFilter ? 1 : 0);

  const leadSourceOptions = useMemo(() => {
    const configured = userProfile.leadSources?.length
      ? userProfile.leadSources
      : Object.values(ContactChannel);
    const inUse = leads.map((lead) => lead.contactChannel as string).filter(Boolean);
    return Array.from(new Set([...configured, ...inUse]));
  }, [userProfile.leadSources, leads]);

  const uniqueCities = useMemo(() => {
    const set = new Set<string>();
    leads.forEach((l) => {
      const c = (l.location || '').trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'id'));
  }, [leads]);

  const toggleHiddenColumns = () => {
    setHiddenColumns((prev) => {
      const newHidden = new Set(prev);
      const completedStatuses: LeadStatus[] = [LeadStatus.CONVERTED, LeadStatus.REJECTED];
      if (newHidden.has(LeadStatus.CONVERTED)) {
        completedStatuses.forEach((s) => newHidden.delete(s));
      } else {
        completedStatuses.forEach((s) => newHidden.add(s));
      }
      return newHidden;
    });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sourceFilter, cityFilter, dateFrom, dateTo, activeCardFilter, mobileStatusTab]);

  const filteredLeads = useMemo(() => {
    return filterLeads(leads, {
      searchTerm,
      sourceFilter,
      cityFilter,
      dateFrom,
      dateTo,
      activeCardFilter,
    });
  }, [leads, searchTerm, sourceFilter, cityFilter, dateFrom, dateTo, activeCardFilter]);

  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLeads.slice(start, start + itemsPerPage);
  }, [filteredLeads, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredLeads.length / itemsPerPage) || 1;

  return {
    searchTerm,
    setSearchTerm,
    sourceFilter,
    setSourceFilter,
    cityFilter,
    setCityFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    activeCardFilter,
    setActiveCardFilter,
    viewMode,
    setViewMode,
    mobileFiltersOpen,
    setMobileFiltersOpen,
    mobileStatusTab,
    setMobileStatusTab,
    hiddenColumns,
    toggleHiddenColumns,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    activeLeadFilterCount,
    leadSourceOptions,
    uniqueCities,
    filteredLeads,
    paginatedLeads,
    totalPages,
  };
}
