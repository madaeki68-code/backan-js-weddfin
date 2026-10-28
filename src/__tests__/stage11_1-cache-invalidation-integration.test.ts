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
  invalidateCalendarEventsCache,
  invalidateFeedbackCache,
  invalidateProfileCache,
  invalidateAllDomainCache,
} from '../services/cacheInvalidation';

describe('Stage 11.1 — Cache Invalidation Integration Audit Test Suite', () => {
  it('verifies query key factory covers all domain query keys used in the application', () => {
    expect(queryKeys.clients.all).toEqual(['clients']);
    expect(queryKeys.projects.all).toEqual(['projects']);
    expect(queryKeys.projects.packageIds).toEqual(['projectPackageIds']);
    expect(queryKeys.transactions.all).toEqual(['transactions']);
    expect(queryKeys.cards.all).toEqual(['cards']);
    expect(queryKeys.pockets.all).toEqual(['pockets']);
    expect(queryKeys.teamMembers.all).toEqual(['teamMembers']);
    expect(queryKeys.teamPayments.all).toEqual(['teamProjectPayments']);
    expect(queryKeys.teamRecords.all).toEqual(['teamPaymentRecords']);
    expect(queryKeys.leads.all).toEqual(['leads']);
    expect(queryKeys.packages.all).toEqual(['packages']);
    expect(queryKeys.addOns.all).toEqual(['addOns']);
    expect(queryKeys.calendarEvents.all).toEqual(['calendarEvents']);
    expect(queryKeys.dashboard.stats).toEqual(['dashboardStats']);
    expect(queryKeys.clientFeedback.all).toEqual(['clientFeedback']);
    expect(queryKeys.profile.all).toEqual(['profile']);
    expect(queryKeys.profile.public).toEqual(['publicProfile']);
  });

  it('verifies lead mutations invalidate leads, clients, projects, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateLeadsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['leads'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies client mutations invalidate clients, projects, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateClientsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies project mutations invalidate projects, clients, calendar events, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateProjectsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['calendarEvents'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies finance mutations invalidate transactions, cards, pockets, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateFinanceCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['pockets'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies team mutations invalidate team members, project payments, payment records, transactions, and stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateTeamCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamMembers'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamProjectPayments'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamPaymentRecords'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies package mutations invalidate packages, add-ons, and project package IDs', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidatePackagesCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['packages'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['addOns'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projectPackageIds'] });
  });

  it('verifies calendar events mutations invalidate calendar events, projects, and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateCalendarEventsCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['calendarEvents'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies feedback mutations invalidate client feedback and dashboard stats', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateFeedbackCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['clientFeedback'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['dashboardStats'] });
  });

  it('verifies profile mutations invalidate profile and public profile', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateProfileCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['profile'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['publicProfile'] });
  });

  it('verifies all domain cache invalidation invalidates every subsystem', async () => {
    const queryClient = new QueryClient();
    const spy = vi.spyOn(queryClient, 'invalidateQueries');

    await invalidateAllDomainCache(queryClient);

    expect(spy).toHaveBeenCalledWith({ queryKey: ['clients'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['projects'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['transactions'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['cards'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['pockets'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['teamMembers'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['leads'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['packages'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['calendarEvents'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['clientFeedback'] });
    expect(spy).toHaveBeenCalledWith({ queryKey: ['profile'] });
  });
});
