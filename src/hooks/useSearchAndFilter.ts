import { useState, useMemo } from 'react';

export interface UseSearchAndFilterOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  filterPredicate?: (item: T) => boolean;
  sortComparator?: (a: T, b: T) => number;
}

export interface UseSearchAndFilterReturn<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredData: T[];
  totalMatches: number;
  hasActiveSearch: boolean;
  clearSearch: () => void;
}

export function useSearchAndFilter<T>({
  data,
  searchKeys = [],
  filterPredicate,
  sortComparator,
}: UseSearchAndFilterOptions<T>): UseSearchAndFilterReturn<T> {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    let result = Array.isArray(data) ? data : [];

    // 1. Custom filter predicate if provided
    if (filterPredicate) {
      result = result.filter(filterPredicate);
    }

    // 2. Text search query matching across searchKeys
    const query = searchQuery.trim().toLowerCase();
    if (query && searchKeys.length > 0) {
      result = result.filter((item) => {
        return searchKeys.some((key) => {
          const val = item[key];
          if (val === null || val === undefined) return false;
          return String(val).toLowerCase().includes(query);
        });
      });
    }

    // 3. Sorting
    if (sortComparator) {
      result = [...result].sort(sortComparator);
    }

    return result;
  }, [data, searchQuery, searchKeys, filterPredicate, sortComparator]);

  return {
    searchQuery,
    setSearchQuery,
    filteredData,
    totalMatches: filteredData.length,
    hasActiveSearch: searchQuery.trim().length > 0,
    clearSearch: () => setSearchQuery(''),
  };
}

export default useSearchAndFilter;
