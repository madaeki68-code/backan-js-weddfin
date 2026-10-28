/**
 * Service Adapters Index
 * Central export untuk semua service adapters
 */

// Auth
export * from './auth-adapter';

// Finance
export * from './finance-adapter';

// Team Payments
export * from './team-payments-adapter';

// Storage
export * from './storage-adapter';

// Calendar
export * from './calendar-adapter';

// Re-export common utilities
export { apiClient, handleApiError, isApiError } from '../api-client';
export {
  setAuthTokens,
  getAuthToken,
  getRefreshToken,
  clearAuthTokens,
  isTokenExpired,
  decodeToken,
  getUserIdFromToken,
  getUserRoleFromToken,
  isAuthenticated as isAuthTokenValid,
} from '../auth-token-manager';
export { useNestJSForModule, getFeatureFlags, logFeatureFlags } from '../../config/features';
