/**
 * Centralized, Type-Safe Query Key Factory for React Query
 * Maintains 100% backward compatibility with existing query keys.
 */

export const queryKeys = {
  clients: {
    all: ['clients'] as const,
    list: (filters?: Record<string, unknown>) => ['clients', 'list', filters] as const,
    detail: (id?: string) => ['clients', 'detail', id] as const,
  },
  projects: {
    all: ['projects'] as const,
    list: (filters?: Record<string, unknown>) => ['projects', 'list', filters] as const,
    detail: (id?: string) => ['projects', 'detail', id] as const,
    packageIds: ['projectPackageIds'] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (filters?: Record<string, unknown>) => ['transactions', 'list', filters] as const,
  },
  teamMembers: {
    all: ['teamMembers'] as const,
    list: (filters?: Record<string, unknown>) => ['teamMembers', 'list', filters] as const,
    detail: (id?: string) => ['teamMembers', 'detail', id] as const,
  },
  leads: {
    all: ['leads'] as const,
    list: (filters?: Record<string, unknown>) => ['leads', 'list', filters] as const,
  },
  cards: {
    all: ['cards'] as const,
  },
  pockets: {
    all: ['pockets'] as const,
  },
  packages: {
    all: ['packages'] as const,
  },
  addOns: {
    all: ['addOns'] as const,
  },
  calendarEvents: {
    all: ['calendarEvents'] as const,
  },
  promoCodes: {
    all: ['promoCodes'] as const,
  },
  profile: {
    all: ['profile'] as const,
    public: ['publicProfile'] as const,
  },
  teamPayments: {
    all: ['teamProjectPayments'] as const,
  },
  teamRecords: {
    all: ['teamPaymentRecords'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
  },
  dashboard: {
    stats: ['dashboardStats'] as const,
  },
  clientFeedback: {
    all: ['clientFeedback'] as const,
  },
} as const;

export default queryKeys;
