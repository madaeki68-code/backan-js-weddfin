import { describe, it, expect, vi } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import {
  invalidateFinanceCache,
  invalidateProjectsCache,
  invalidateClientsCache,
  invalidateTeamCache,
  invalidateLeadsCache,
  invalidatePackagesCache,
} from '../services/cacheInvalidation';

describe('Stage 11 — React Query Architecture & Cache Invalidation Audit', () => {
  it('provides consistent, type-safe query keys matching existing domain keys', () => {
    expect(queryKeys.clients.all).toEqual(['clients']);
    expect(queryKeys.projects.all).toEqual(['projects']);
    expect(queryKeys.projects.packageIds).toEqual(['projectPackageIds']);
    expect(queryKeys.transactions.all).toEqual(['transactions']);
    expect(queryKeys.teamMembers.all).toEqual(['teamMembers']);
    expect(queryKeys.leads.all).toEqual(['leads']);
    expect(queryKeys.cards.all).toEqual(['cards']);
    expect(queryKeys.pockets.all).toEqual(['pockets']);
    expect(queryKeys.packages.all).toEqual(['packages']);
    expect(queryKeys.addOns.all).toEqual(['addOns']);
    expect(queryKeys.calendarEvents.all).toEqual(['calendarEvents']);
    expect(queryKeys.promoCodes.all).toEqual(['promoCodes']);
    expect(queryKeys.profile.all).toEqual(['profile']);
    expect(queryKeys.profile.public).toEqual(['publicProfile']);
    expect(queryKeys.teamPayments.all).toEqual(['teamProjectPayments']);
    expect(queryKeys.teamRecords.all).toEqual(['teamPaymentRecords']);
    expect(queryKeys.notifications.all).toEqual(['notifications']);
    expect(queryKeys.dashboard.stats).toEqual(['dashboardStats']);
    expect(queryKeys.clientFeedback.all).toEqual(['clientFeedback']);
  });

  it('invalidates finance cache across transactions, cards, pockets, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateFinanceCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['pockets'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('invalidates projects cache across projects, clients, calendar events, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateProjectsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['calendarEvents'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('invalidates clients cache across clients, projects, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateClientsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('invalidates team cache across team members, payments, payment records, transactions, and stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateTeamCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamMembers'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamProjectPayments'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamPaymentRecords'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('invalidates leads cache across leads, clients, projects, and stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateLeadsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['leads'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('invalidates packages cache across packages, add-ons, and popular package IDs', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidatePackagesCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['packages'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['addOns'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projectPackageIds'] });
  });
});
