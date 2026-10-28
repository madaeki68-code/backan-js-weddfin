import { useState, useMemo, useCallback, useEffect } from 'react';

export interface UsePaginationOptions<T> {
  data: T[];
  initialPage?: number;
  initialItemsPerPage?: number;
}

export interface UsePaginationReturn<T> {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (itemsPerPage: number) => void;
  totalPages: number;
  totalItems: number;
  paginatedData: T[];
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canNextPage: boolean;
  canPreviousPage: boolean;
}

export function usePagination<T>({
  data,
  initialPage = 1,
  initialItemsPerPage = 10,
}: UsePaginationOptions<T>): UsePaginationReturn<T> {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

  const totalItems = data.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  // Auto adjust if current page exceeds total pages
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Synchronize internal state if data size reduces
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedData = useMemo(() => {
    const startIndex = (safeCurrentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  }, [data, safeCurrentPage, itemsPerPage]);

  const goToNextPage = useCallback(() => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPreviousPage = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  }, []);

  return {
    currentPage: safeCurrentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    totalItems,
    paginatedData,
    goToNextPage,
    goToPreviousPage,
    canNextPage: safeCurrentPage < totalPages,
    canPreviousPage: safeCurrentPage > 1,
  };
}

export default usePagination;
