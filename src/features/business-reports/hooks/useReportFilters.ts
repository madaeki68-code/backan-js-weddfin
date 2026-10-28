import { useState, useMemo, useCallback } from 'react';
import { ClientStatus } from '../../../types';
import {
  getCurrentMonthKey,
  monthKeyToRange,
  formatMonthKeyLabel,
  toLocalDateString,
} from '../../clients/utils/clientFormatters';
import { ReportDatePreset } from '../types/businessReports.types';

export function useReportFilters() {
  const [monthFilter, setMonthFilter] = useState<string>(getCurrentMonthKey);
  const [dateFrom, setDateFrom] = useState(() => monthKeyToRange(getCurrentMonthKey())[0]);
  const [dateTo, setDateTo] = useState(() => monthKeyToRange(getCurrentMonthKey())[1]);
  const [activePreset, setActivePreset] = useState<ReportDatePreset>('this-month');

  const [clientTypeFilter, setClientTypeFilter] = useState<'all' | 'direct' | 'vendor'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | 'all'>('all');

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'value' | 'status'>('date');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const handleDateChange = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setCurrentPage(1);
  }, []);

  const handleSetDatePreset = useCallback((preset: ReportDatePreset) => {
    setActivePreset(preset);
    const now = new Date();
    if (preset === 'all') {
      setMonthFilter('');
      handleDateChange('', '');
      return;
    }
    if (preset === 'this-month') {
      const first = toLocalDateString(new Date(now.getFullYear(), now.getMonth(), 1));
      const last = toLocalDateString(new Date(now.getFullYear(), now.getMonth() + 1, 0));
      setMonthFilter(getCurrentMonthKey());
      handleDateChange(first, last);
      return;
    }
    setMonthFilter('');
    if (preset === 'this-quarter') {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const first = toLocalDateString(new Date(now.getFullYear(), qMonth, 1));
      const last = toLocalDateString(new Date(now.getFullYear(), qMonth + 3, 0));
      handleDateChange(first, last);
      return;
    }
    if (preset === 'this-year') {
      const first = toLocalDateString(new Date(now.getFullYear(), 0, 1));
      const last = toLocalDateString(new Date(now.getFullYear(), 11, 31));
      handleDateChange(first, last);
      return;
    }
  }, [handleDateChange]);

  const handleMonthChange = useCallback((value: string) => {
    setMonthFilter(value);
    setActivePreset('all');
    const [first, last] = monthKeyToRange(value);
    handleDateChange(first, last);
  }, [handleDateChange]);

  const reportPeriodLabel = useMemo(() => {
    if (monthFilter) return formatMonthKeyLabel(monthFilter);
    if (dateFrom || dateTo) return `${dateFrom || '...'} s/d ${dateTo || '...'}`;
    return 'Semua Periode';
  }, [monthFilter, dateFrom, dateTo]);

  return {
    monthFilter,
    dateFrom,
    dateTo,
    activePreset,
    clientTypeFilter,
    setClientTypeFilter,
    cityFilter,
    setCityFilter,
    packageFilter,
    setPackageFilter,
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    handleDateChange,
    handleSetDatePreset,
    handleMonthChange,
    reportPeriodLabel,
  };
}
