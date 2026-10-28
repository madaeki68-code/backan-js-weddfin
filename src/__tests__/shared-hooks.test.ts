import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDisclosure } from '../hooks/useDisclosure';
import { usePagination } from '../hooks/usePagination';
import { useSearchAndFilter } from '../hooks/useSearchAndFilter';
import { useConfirm } from '../hooks/useConfirm';

describe('Shared Architecture — Custom Hooks', () => {
  describe('useDisclosure', () => {
    it('manages open and close state transitions', () => {
      const { result } = renderHook(() => useDisclosure(false));

      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.onOpen();
      });
      expect(result.current.isOpen).toBe(true);

      act(() => {
        result.current.onClose();
      });
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.onToggle();
      });
      expect(result.current.isOpen).toBe(true);
    });
  });

  describe('usePagination', () => {
    const testData = Array.from({ length: 25 }, (_, i) => ({ id: i + 1, name: `Item ${i + 1}` }));

    it('calculates total pages and slices data correctly', () => {
      const { result } = renderHook(() =>
        usePagination({ data: testData, initialItemsPerPage: 10 })
      );

      expect(result.current.totalItems).toBe(25);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.paginatedData.length).toBe(10);
      expect(result.current.paginatedData[0].id).toBe(1);

      act(() => {
        result.current.goToNextPage();
      });
      expect(result.current.currentPage).toBe(2);
      expect(result.current.paginatedData[0].id).toBe(11);

      act(() => {
        result.current.goToNextPage();
      });
      expect(result.current.currentPage).toBe(3);
      expect(result.current.paginatedData.length).toBe(5);

      act(() => {
        result.current.goToPreviousPage();
      });
      expect(result.current.currentPage).toBe(2);
    });
  });

  describe('useSearchAndFilter', () => {
    const items = [
      { id: '1', name: 'Rian & Maya Wedding', category: 'Exclusive' },
      { id: '2', name: 'Bayu & Citra Akad', category: 'Intimate' },
      { id: '3', name: 'Dimas & Sinta Prewed', category: 'Outdoor' },
    ];

    it('filters items by search query across keys', () => {
      const { result } = renderHook(() =>
        useSearchAndFilter({
          data: items,
          searchKeys: ['name', 'category'],
        })
      );

      expect(result.current.totalMatches).toBe(3);
      expect(result.current.hasActiveSearch).toBe(false);

      act(() => {
        result.current.setSearchQuery('Bayu');
      });

      expect(result.current.hasActiveSearch).toBe(true);
      expect(result.current.totalMatches).toBe(1);
      expect(result.current.filteredData[0].name).toContain('Bayu');

      act(() => {
        result.current.clearSearch();
      });

      expect(result.current.hasActiveSearch).toBe(false);
      expect(result.current.totalMatches).toBe(3);
    });
  });

  describe('useConfirm', () => {
    it('manages confirmation dialog state and resolves confirmation', async () => {
      const { result } = renderHook(() => useConfirm());

      expect(result.current.isOpen).toBe(false);

      let promise: Promise<boolean>;
      act(() => {
        promise = result.current.confirm({
          title: 'Hapus Item',
          message: 'Apakah Anda yakin?',
          variant: 'danger',
        });
      });

      expect(result.current.isOpen).toBe(true);
      expect(result.current.confirmDialogProps.title).toBe('Hapus Item');

      // Simulate user clicking confirm
      act(() => {
        result.current.confirmDialogProps.onConfirm();
      });

      const confirmed = await promise!;
      expect(confirmed).toBe(true);
      expect(result.current.isOpen).toBe(false);
    });
  });
});
