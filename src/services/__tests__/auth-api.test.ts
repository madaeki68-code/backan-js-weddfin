import { afterEach, describe, expect, it, vi } from 'vitest';
import { apiRequest } from '../apiClient';
import { getCurrentUser, login } from '../auth';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

afterEach(() => fetchMock.mockReset());

describe('central API authentication client', () => {
  it('logs in through the API, accepts the standardized envelope and maps the backend user', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { user: { id: 'u1', email: 'owner@example.com', role: 'admin', profile: { ownerName: 'Owner', businessName: 'Attera' } } },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expect(login('owner@example.com', 'secret')).resolves.toMatchObject({
      id: 'u1', email: 'owner@example.com', fullName: 'Owner', companyName: 'Attera', role: 'Admin',
    });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('http://localhost:4000/api/v1/auth/login');
    expect(options.credentials).toBe('include');
    expect(JSON.parse(options.body)).toEqual({ email: 'owner@example.com', password: 'secret' });
  });

  it('restores the session from the HttpOnly cookie without storing a token in JavaScript', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: true,
      data: { id: 'u2', email: 'staff@example.com', role: 'crew' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

    await expect(getCurrentUser()).resolves.toMatchObject({ id: 'u2', role: 'Member' });
    expect(fetchMock.mock.calls[0][1].credentials).toBe('include');
  });

  it('returns the backend error and HTTP status for failed requests', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({
      success: false, error: { code: 'UNAUTHORIZED', message: 'Email atau password salah' },
    }), { status: 401, headers: { 'Content-Type': 'application/json' } }));

    await expect(apiRequest('/auth/login', { method: 'POST', body: '{}' })).rejects.toMatchObject({
      message: 'Email atau password salah', status: 401, code: 'UNAUTHORIZED',
    });
  });

  it('accepts a successful empty response for delete operations', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    await expect(apiRequest<void>('/clients/client-1', { method: 'DELETE' })).resolves.toBeUndefined();
  });
});
