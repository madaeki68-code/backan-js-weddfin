import { useQuery } from '@tanstack/react-query';
import { listClients } from '../services/clients';
import { listProjectsWithRelations, listProjectPackageIds } from '../services/projects';
import { listTransactions } from '../services/transactions';
import { listTeamMembers } from '../services/teamMembers';
import { listLeads } from '../services/leads';
import { listCards, normalizeCard } from '../services/cards';
import { listPockets } from '../services/pockets';
import { listPackages } from '../services/packages';
import { listAddOns } from '../services/addOns';
import { listCalendarEvents } from '../services/calendarEvents';
import { listPromoCodes } from '../services/promoCodes';
import { getProfile, getPublicProfile } from '../services/profile';
import { listAllTeamPayments } from '../services/teamProjectPayments';
import { listTeamPaymentRecords } from '../services/teamPaymentRecords';
import { listNotifications } from '../services/notifications';
import { queryKeys } from '../services/queryKeys';

// Limit default fetches to 100 for performance
const DEFAULT_LIMIT = 100;
const REALTIME_STALE_TIME = 5 * 60 * 1000;

export interface DomainQueryOptions {
  /**
   * `false` untuk halaman publik ringan: query tidak dikirim sama sekali
   * sampai halaman yang memang membutuhkannya mount.
   */
  enabled?: boolean;
  /** Return only the profile fields required by public forms/documents. */
  publicData?: boolean;
}

export const useClientsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.clients.all,
    queryFn: () => listClients({ limit: DEFAULT_LIMIT }),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useProjectsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: () => listProjectsWithRelations({ limit: DEFAULT_LIMIT }),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useProjectPackageIdsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.projects.packageIds,
    queryFn: () => listProjectPackageIds(),
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled !== false,
  });

export const useTransactionsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.transactions.all,
    queryFn: () => listTransactions({ limit: DEFAULT_LIMIT }),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useTeamMembersQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.teamMembers.all,
    queryFn: () => listTeamMembers({ limit: DEFAULT_LIMIT }),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useLeadsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.leads.all,
    queryFn: () => listLeads({ limit: DEFAULT_LIMIT }),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useCardsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.cards.all,
    queryFn: () => listCards().then((res) => res.map(normalizeCard)),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const usePocketsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.pockets.all,
    queryFn: () => listPockets(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const usePackagesQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.packages.all,
    queryFn: () => listPackages(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useAddOnsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.addOns.all,
    queryFn: () => listAddOns(),
    staleTime: 5 * 60 * 1000,
    enabled: options.enabled !== false,
  });

export const useCalendarEventsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.calendarEvents.all,
    queryFn: () => listCalendarEvents(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const usePromoCodesQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.promoCodes.all,
    queryFn: () => listPromoCodes(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useProfileQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: options.publicData ? queryKeys.profile.public : queryKeys.profile.all,
    queryFn: () => (options.publicData ? getPublicProfile() : getProfile()),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useTeamProjectPaymentsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.teamPayments.all,
    queryFn: () => listAllTeamPayments(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useTeamPaymentRecordsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.teamRecords.all,
    queryFn: () => listTeamPaymentRecords(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });

export const useNotificationsQuery = (options: DomainQueryOptions = {}) =>
  useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: () => listNotifications(),
    staleTime: REALTIME_STALE_TIME,
    enabled: options.enabled !== false,
  });
