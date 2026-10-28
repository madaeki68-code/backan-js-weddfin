/**
 * Auth Adapter
 * Wrapper untuk Authentication API
 */

import { apiClient, handleApiError } from '../api-client';
import {
  setAuthTokens,
  clearAuthTokens,
  isAuthenticated as checkAuthStatus,
  getUserIdFromToken,
  getUserRoleFromToken,
} from '../auth-token-manager';
import { useNestJSForModule } from '../../config/features';
import supabase from '../../lib/supabaseClient';

// ========== TYPES ==========

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName?: string;
  businessName?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
}

export interface UserDTO {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'crew' | 'client';
  isActive: boolean;
  profile?: ProfileDTO;
}

export interface ProfileDTO {
  id: string;
  businessName: string;
  ownerName?: string;
  phone?: string;
  address?: string;
  logoUrl?: string;
  instagramHandle?: string;
  websiteUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordInput {
  email: string;
}

export interface UpdatePasswordWithTokenInput {
  token: string;
  newPassword: string;
}

// ========== AUTHENTICATION ==========

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      const data = await apiClient.post<LoginResponse>(
        '/auth/login',
        credentials,
        { requiresAuth: false }
      );

      // Store tokens
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    } else {
      // Supabase fallback
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('Login gagal');

      // Store tokens (Supabase format)
      setAuthTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: 'admin', // Default role
          isActive: true,
        },
      };
    }
  } catch (error) {
    console.error('[Auth Adapter] Login error:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Register new user
 */
export async function register(input: RegisterInput): Promise<LoginResponse> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      const data = await apiClient.post<LoginResponse>(
        '/auth/register',
        input,
        { requiresAuth: false }
      );

      // Store tokens
      setAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      return data;
    } else {
      // Supabase fallback
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
      });

      if (error) throw error;
      if (!data.session) throw new Error('Registrasi gagal');

      setAuthTokens({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      });

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email!,
          role: 'admin',
          isActive: true,
        },
      };
    }
  } catch (error) {
    console.error('[Auth Adapter] Register error:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      await apiClient.post('/auth/logout', {});
    } else {
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.error('[Auth Adapter] Logout error:', error);
    // Don't throw, always clear local tokens
  } finally {
    clearAuthTokens();
  }
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<UserDTO | null> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      const data = await apiClient.get<UserDTO>('/auth/me');
      return data;
    } else {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return null;

      return {
        id: data.user.id,
        email: data.user.email!,
        role: 'admin',
        isActive: true,
      };
    }
  } catch (error) {
    console.error('[Auth Adapter] Get current user error:', error);
    return null;
  }
}

/**
 * Change password (for logged-in user)
 */
export async function changePassword(input: ChangePasswordInput): Promise<void> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      await apiClient.post('/auth/change-password', input);
    } else {
      const { error } = await supabase.auth.updateUser({
        password: input.newPassword,
      });
      if (error) throw error;
    }
  } catch (error) {
    console.error('[Auth Adapter] Change password error:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Request password reset (send email)
 */
export async function requestPasswordReset(input: ResetPasswordInput): Promise<void> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      await apiClient.post('/auth/request-password-reset', input, { requiresAuth: false });
    } else {
      const { error } = await supabase.auth.resetPasswordForEmail(input.email);
      if (error) throw error;
    }
  } catch (error) {
    console.error('[Auth Adapter] Request password reset error:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update password with reset token
 */
export async function updatePasswordWithToken(input: UpdatePasswordWithTokenInput): Promise<void> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      await apiClient.post('/auth/reset-password', input, { requiresAuth: false });
    } else {
      // Supabase uses different flow
      throw new Error('Reset password with token not implemented for Supabase');
    }
  } catch (error) {
    console.error('[Auth Adapter] Update password with token error:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== AUTH STATE ==========

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return checkAuthStatus();
}

/**
 * Get user ID from token (without API call)
 */
export function getCurrentUserId(): string | null {
  return getUserIdFromToken();
}

/**
 * Get user role from token (without API call)
 */
export function getCurrentUserRole(): string | null {
  return getUserRoleFromToken();
}

/**
 * Check if user has specific role
 */
export function hasRole(role: string): boolean {
  const userRole = getCurrentUserRole();
  return userRole === role;
}

/**
 * Check if user is admin or superadmin
 */
export function isAdmin(): boolean {
  const role = getCurrentUserRole();
  return role === 'admin' || role === 'superadmin';
}

/**
 * Check if user is superadmin
 */
export function isSuperAdmin(): boolean {
  return hasRole('superadmin');
}

// ========== SESSION MANAGEMENT ==========

/**
 * Refresh auth session
 */
export async function refreshSession(): Promise<void> {
  const useNestJS = useNestJSForModule('auth');

  try {
    if (useNestJS) {
      // Token refresh handled automatically by API client
      await getCurrentUser(); // Trigger refresh if needed
    } else {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data.session) {
        setAuthTokens({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        });
      }
    }
  } catch (error) {
    console.error('[Auth Adapter] Refresh session error:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Listen to auth state changes (for Supabase compatibility)
 */
export function onAuthStateChange(
  callback: (event: string, session: any) => void
): () => void {
  const useNestJS = useNestJSForModule('auth');

  if (useNestJS) {
    // For NestJS, we don't have real-time auth changes
    // But we can check periodically or on focus
    const interval = setInterval(async () => {
      const authenticated = isAuthenticated();
      if (authenticated) {
        const user = await getCurrentUser();
        callback('SIGNED_IN', user);
      } else {
        callback('SIGNED_OUT', null);
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  } else {
    const { data } = supabase.auth.onAuthStateChange(callback);
    return () => data.subscription.unsubscribe();
  }
}

// ========== UTILITIES ==========

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;

  if (password.length < 8) {
    errors.push('Password minimal 8 karakter');
  } else {
    score += 1;
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password harus mengandung huruf kecil');
  } else {
    score += 1;
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password harus mengandung huruf besar');
  } else {
    score += 1;
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password harus mengandung angka');
  } else {
    score += 1;
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Password harus mengandung karakter khusus');
  } else {
    score += 1;
  }

  const strength = score <= 2 ? 'weak' : score <= 3 ? 'medium' : 'strong';

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Clear all auth data (for cleanup)
 */
export function clearAuthData(): void {
  clearAuthTokens();
  // Clear any other auth-related data from localStorage
  localStorage.removeItem('user_profile');
  localStorage.removeItem('user_preferences');
}
