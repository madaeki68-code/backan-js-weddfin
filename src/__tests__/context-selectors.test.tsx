import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  SimplifiedDataProvider,
  useSimplifiedClients,
  useSimplifiedProjects,
  useSimplifiedTransactions,
  useSimplifiedTeamMembers,
} from '../contexts/SimplifiedDataContext';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <SimplifiedDataProvider>{children}</SimplifiedDataProvider>
    </QueryClientProvider>
  );

  return Wrapper;
};

describe('SimplifiedDataContext — Selector Hooks Audit', () => {
  it('provides isolated selector state for clients', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSimplifiedClients(), { wrapper });

    expect(Array.isArray(result.current.clients)).toBe(true);
    expect(typeof result.current.setClients).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('provides isolated selector state for projects', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSimplifiedProjects(), { wrapper });

    expect(Array.isArray(result.current.projects)).toBe(true);
    expect(typeof result.current.setProjects).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('provides isolated selector state for transactions', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSimplifiedTransactions(), { wrapper });

    expect(Array.isArray(result.current.transactions)).toBe(true);
    expect(typeof result.current.setTransactions).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });

  it('provides isolated selector state for team members', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSimplifiedTeamMembers(), { wrapper });

    expect(Array.isArray(result.current.teamMembers)).toBe(true);
    expect(typeof result.current.setTeamMembers).toBe('function');
    expect(typeof result.current.refetch).toBe('function');
  });
});
