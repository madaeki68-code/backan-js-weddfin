export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1')
  .replace(/\/+$/, '');

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  let response: Response;
  try {
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (options.body && !headers.has('Content-Type') && !(typeof FormData !== 'undefined' && options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...options,
      credentials: 'include',
      headers,
      signal: options.signal ?? AbortSignal.timeout(15_000),
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'TimeoutError') {
      throw new ApiError('Permintaan ke server melewati batas waktu.', 0, 'TIMEOUT');
    }
    throw new ApiError('Server tidak dapat dijangkau. Periksa koneksi Anda.', 0, 'NETWORK_ERROR');
  }

  if (response.status === 204 || response.status === 205) return undefined as T;

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError('Server mengirim respons yang tidak valid.', response.status, 'INVALID_RESPONSE');
  }

  if (!response.ok) {
    const body = payload as { error?: { message?: string | string[]; code?: string }; message?: string | string[] };
    const errorMessage = body.error?.message || body.message;
    throw new ApiError(
      Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage || 'Permintaan gagal diproses.',
      response.status,
      body.error?.code,
    );
  }

  const envelope = payload as ApiEnvelope<T>;
  return envelope && typeof envelope === 'object' && 'data' in envelope
    ? envelope.data
    : (payload as T);
}
