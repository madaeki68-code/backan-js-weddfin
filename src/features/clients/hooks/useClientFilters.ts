import { useState, useMemo } from 'react';
import {
  Client,
  Project,
  ClientsTotals,
  ClientTabType,
  ClientViewSection,
} from '../types';
import {
  buildAllClientData,
  filterClientData,
  computeClientsWithDues,
  computeCurrentMonthEvents,
  computeClientStatusDonutData,
  computeNewClientsChartData,
} from '../utils/clientFilters';
import { computeClientSummaryStats } from '../utils/clientStats';

interface UseClientFiltersParams {
  clients: Client[];
  projects: Project[];
  totals: ClientsTotals;
}

export function useClientFilters({ clients, projects, totals }: UseClientFiltersParams) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua Status');
  const [monthFilter, setMonthFilter] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [clientTab, setClientTab] = useState<ClientTabType>('this-month');
  const [activeViewSection, setActiveViewSection] = useState<ClientViewSection>('clients');
  const [showAllDues, setShowAllDues] = useState(false);

  const allClientData = useMemo(() => {
    return buildAllClientData(clients, projects);
  }, [clients, projects]);

  const filteredClientData = useMemo(() => {
    return filterClientData(allClientData, {
      searchTerm,
      statusFilter,
      dateFrom,
      dateTo,
      monthFilter,
    });
  }, [allClientData, searchTerm, statusFilter, dateFrom, dateTo, monthFilter]);

  const clientStats = useMemo(() => {
    return computeClientSummaryStats(allClientData, totals);
  }, [allClientData, totals]);

  const clientsWithDues = useMemo(() => {
    return computeClientsWithDues(allClientData, monthFilter);
  }, [allClientData, monthFilter]);

  const currentMonthEvents = useMemo(() => {
    return computeCurrentMonthEvents(allClientData);
  }, [allClientData]);

  const clientStatusDonutData = useMemo(() => {
    return computeClientStatusDonutData(clients);
  }, [clients]);

  const newClientsChartData = useMemo(() => {
    return computeNewClientsChartData(clients);
  }, [clients]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    monthFilter,
    setMonthFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    clientTab,
    setClientTab,
    activeViewSection,
    setActiveViewSection,
    showAllDues,
    setShowAllDues,
    allClientData,
    filteredClientData,
    clientStats,
    clientsWithDues,
    currentMonthEvents,
    clientStatusDonutData,
    newClientsChartData,
  };
}

export default useClientFilters;
