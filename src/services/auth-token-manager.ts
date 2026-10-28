/**
 * Auth Token Manager
 * Handles JWT access token and refresh token storage and management
 */

const ACCESS_TOKEN_KEY = 'auth_access_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

/**
 * Store auth tokens in localStorage
 */
export function setAuthTokens(tokens: AuthTokens): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/**
 * Get access token from localStorage
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp;
    if (!exp) return true;

    // Check if token expires in less than 60 seconds (preemptive refresh)
    const now = Math.floor(Date.now() / 1000);
    return exp - now < 60;
  } catch (error) {
    console.error('Failed to parse token:', error);
    return true;
  }
}

/**
 * Decode JWT token payload
 */
export function decodeToken(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Get user ID from access token
 */
export function getUserIdFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.sub || null;
}

/**
 * Get user role from access token
 */
export function getUserRoleFromToken(): string | null {
  const token = getAuthToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload?.role || null;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAuthToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    // Store new access token
    localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

    // If new refresh token provided, store it too
    if (data.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }

    return newAccessToken;
  } catch (error) {
    // Refresh failed, clear tokens
    clearAuthTokens();
    throw error;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  return !isTokenExpired(token);
}
