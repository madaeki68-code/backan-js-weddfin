import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGoogleCalendarFeed, getGoogleCalendarFeedStatus, revokeGoogleCalendarFeed } from '../googleCalendarFeed';

describe('Google Calendar feed API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('reads feed status through the authenticated Nest API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: { active: true } }), { status: 200 }));
    await expect(getGoogleCalendarFeedStatus()).resolves.toEqual({ active: true });
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/calendar/google-feed'), expect.objectContaining({
      method: 'POST', credentials: 'include', body: JSON.stringify({ action: 'status' }),
    }));
  });

  it('returns a newly generated calendar subscription URL', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: { active: true, url: 'https://api.test/feed' } }), { status: 200 }));
    await expect(createGoogleCalendarFeed()).resolves.toEqual({ active: true, url: 'https://api.test/feed' });
  });

  it('surfaces server errors while revoking a feed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ message: 'Akses ditolak' }), { status: 403 }));
    await expect(revokeGoogleCalendarFeed()).rejects.toThrow('Akses ditolak');
  });
});
