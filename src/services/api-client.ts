/**
 * API Client for NestJS Backend
 * Base HTTP client with authentication, retry logic, and error handling
 */

import { getAuthToken, refreshAuthToken, isTokenExpired } from './auth-token-manager';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
  errors?: any[];
}

class ApiClient {
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.timeout = config.timeout || 30000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Make HTTP request with automatic token injection and retry logic
   */
  private async request<T = any>(
    method: string,
    path: string,
    options: {
      body?: any;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      isFormData?: boolean;
      signal?: AbortSignal;
    } = {}
  ): Promise<ApiResponse<T>> {
    const {
      body,
      headers = {},
      requiresAuth = true,
      isFormData = false,
      signal,
    } = options;

    const url = `${this.baseURL}${path}`;
    const requestHeaders: Record<string, string> = { ...this.defaultHeaders, ...headers };

    // Remove Content-Type for FormData (browser will set it with boundary)
    if (isFormData) {
      delete requestHeaders['Content-Type'];
    }

    // Inject auth token if required
    if (requiresAuth) {
      let token = getAuthToken();

      // Check if token is expired, refresh if needed
      if (token && isTokenExpired(token)) {
        try {
          const newToken = await refreshAuthToken();
          token = newToken;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          // Token refresh failed, will try with old token or fail at API level
        }
      }

      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    // Setup timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: isFormData ? body : body ? JSON.stringify(body) : undefined,
        signal: signal || controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData: ApiError = await response.json().catch(() => ({
          message: response.statusText || 'Request failed',
          statusCode: response.status,
        }));

        throw {
          ...errorData,
          statusCode: response.status,
        };
      }

      // Parse response
      const contentType = response.headers.get('content-type');
      let data: T;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = (await response.text()) as any;
      } else {
        data = (await response.blob()) as any;
      }

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw {
          message: 'Request timeout',
          statusCode: 408,
        };
      }

      // Network error
      if (!error.statusCode) {
        throw {
          message: error.message || 'Network error',
          statusCode: 0,
        };
      }

      throw error;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(
    path: string,
    options?: {
      params?: Record<string, any>;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const { params, ...restOptions } = options || {};

    // Build query string
    let finalPath = path;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null)
          .map(([key, value]) => [key, String(value)])
      ).toString();
      if (queryString) {
        finalPath += `?${queryString}`;
      }
    }

    const response = await this.request<T>('GET', finalPath, restOptions);
    return response.data;
  }

  /**
   * POST request
   */
  async post<T = any>(
    path: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      isFormData?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const response = await this.request<T>('POST', path, { body, ...options });
    return response.data;
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    path: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const response = await this.request<T>('PATCH', path, { body, ...options });
    return response.data;
  }

  /**
   * PUT request
   */
  async put<T = any>(
    path: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const response = await this.request<T>('PUT', path, { body, ...options });
    return response.data;
  }

  /**
   * DELETE request
   */
  async delete<T = any>(
    path: string,
    options?: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const response = await this.request<T>('DELETE', path, options);
    return response.data;
  }

  /**
   * Upload file(s)
   */
  async upload<T = any>(
    path: string,
    file: File | File[],
    options?: {
      fieldName?: string;
      additionalData?: Record<string, any>;
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      onProgress?: (progress: number) => void;
      signal?: AbortSignal;
    }
  ): Promise<T> {
    const {
      fieldName = 'file',
      additionalData = {},
      headers = {},
      requiresAuth = true,
      signal,
    } = options || {};

    const formData = new FormData();

    // Append file(s)
    if (Array.isArray(file)) {
      file.forEach((f) => formData.append(fieldName, f));
    } else {
      formData.append(fieldName, file);
    }

    // Append additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    return this.post<T>(path, formData, {
      headers,
      requiresAuth,
      isFormData: true,
      signal,
    });
  }

  /**
   * Download file
   */
  async download(
    path: string,
    options?: {
      headers?: Record<string, string>;
      requiresAuth?: boolean;
      signal?: AbortSignal;
    }
  ): Promise<Blob> {
    const response = await this.request<Blob>('GET', path, options);
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for custom instances
export default ApiClient;

/**
 * Helper to handle API errors
 */
export function handleApiError(error: any): string {
  if (error.statusCode === 0) {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
  }

  if (error.statusCode === 401) {
    return 'Sesi Anda telah berakhir. Silakan login kembali.';
  }

  if (error.statusCode === 403) {
    return 'Anda tidak memiliki akses untuk melakukan operasi ini.';
  }

  if (error.statusCode === 404) {
    return 'Data tidak ditemukan.';
  }

  if (error.statusCode === 408) {
    return 'Request timeout. Silakan coba lagi.';
  }

  if (error.statusCode >= 500) {
    return 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
  }

  return error.message || 'Terjadi kesalahan. Silakan coba lagi.';
}

/**
 * Helper to check if error is API error
 */
export function isApiError(error: any): error is ApiError {
  return error && typeof error.statusCode === 'number';
}
