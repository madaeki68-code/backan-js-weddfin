import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GoogleCalendarFeedService, buildCalendarFeed } from './google-calendar-feed.service.js';

describe('GoogleCalendarFeedService', () => {
  const prisma = {
    googleCalendarFeedToken: { findUnique: vi.fn(), upsert: vi.fn(), deleteMany: vi.fn() },
    project: { findMany: vi.fn() },
    calendarEvent: { findMany: vi.fn() },
  };
  const service = new GoogleCalendarFeedService(prisma as never, { get: () => 'https://api.example.test/api/v1' } as never);
  beforeEach(() => vi.clearAllMocks());

  it('creates a random feed token but persists only its SHA-256 hash', async () => {
    prisma.googleCalendarFeedToken.upsert.mockResolvedValue({});
    const result = await service.manage('profile-1', 'user-1', 'admin', 'create');
    const token = new URL(result.url!).searchParams.get('token')!;
    expect(token).toMatch(/^[a-f0-9]{64}$/);
    expect(prisma.googleCalendarFeedToken.upsert.mock.calls[0][0].create).toMatchObject({ profileId: 'profile-1', createdBy: 'user-1' });
    expect(prisma.googleCalendarFeedToken.upsert.mock.calls[0][0].create.tokenHash).not.toBe(token);
    expect(result.url).toContain('/api/v1/calendar/google-feed/feed?token=');
  });

  it('does not allow non-admin feed management and revokes active feed tokens', async () => {
    await expect(service.manage('profile-1', 'crew-1', 'crew', 'create')).rejects.toMatchObject({ status: 403 });
    prisma.googleCalendarFeedToken.deleteMany.mockResolvedValue({ count: 1 });
    await expect(service.manage('profile-1', 'user-1', 'admin', 'revoke')).resolves.toEqual({ active: false });
    expect(prisma.googleCalendarFeedToken.deleteMany).toHaveBeenCalledWith({ where: { profileId: 'profile-1' } });
  });

  it('rejects invalid or revoked public feed tokens', async () => {
    await expect(service.feed('short')).rejects.toMatchObject({ status: 404 });
    prisma.googleCalendarFeedToken.findUnique.mockResolvedValue(null);
    await expect(service.feed('a'.repeat(64))).rejects.toMatchObject({ status: 404 });
  });

  it('builds an RFC 5545 feed with escaped text and timed events', () => {
    const feed = buildCalendarFeed([], [{
      id: 'event-1', title: 'Wedding, day 1', date: new Date('2026-10-28T00:00:00Z'),
      startTime: new Date('1970-01-01T10:00:00Z'), endTime: new Date('1970-01-01T11:00:00Z'),
      notes: 'line one\nline two',
    }]);
    expect(feed).toContain('SUMMARY:Wedding\\, day 1');
    expect(feed).toContain('DTSTART:20261028T030000Z');
    expect(feed).toContain('DESCRIPTION:line one\\nline two');
    expect(feed).toMatch(/\r\nEND:VCALENDAR\r\n$/);
  });
});
