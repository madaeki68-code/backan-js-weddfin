import { QueryClient } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

/**
 * Standardized Cache Invalidation Helpers for React Query
 */

export const invalidateFinanceCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.cards.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.pockets.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateProjectsCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateClientsCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateTeamCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.teamMembers.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.teamPayments.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.teamRecords.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateLeadsCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.leads.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.clients.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidatePackagesCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.packages.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.addOns.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.packageIds }),
  ]);
};

export const invalidateCalendarEventsCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateFeedbackCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.clientFeedback.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats }),
  ]);
};

export const invalidateProfileCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.profile.public }),
  ]);
};

export const invalidateAllDomainCache = (queryClient: QueryClient): Promise<void[]> => {
  return Promise.all([
    invalidateClientsCache(queryClient),
    invalidateProjectsCache(queryClient),
    invalidateFinanceCache(queryClient),
    invalidateTeamCache(queryClient),
    invalidateLeadsCache(queryClient),
    invalidatePackagesCache(queryClient),
    invalidateCalendarEventsCache(queryClient),
    invalidateFeedbackCache(queryClient),
    invalidateProfileCache(queryClient),
  ]).then((nested) => nested.flat());
};
