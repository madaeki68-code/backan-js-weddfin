import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarService } from './calendar.service.js';

describe('CalendarService', () => {
  const prisma = {
    calendarEvent: { findMany: vi.fn(), create: vi.fn(), findFirst: vi.fn(), update: vi.fn(), delete: vi.fn() },
    project: { findFirst: vi.fn() },
    client: { findFirst: vi.fn() },
    teamMember: { findFirst: vi.fn() },
  };
  const service = new CalendarService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('lists only the current profile within the requested date range', async () => {
    prisma.calendarEvent.findMany.mockResolvedValue([]);
    await service.list('profile-1', '2026-01-01', '2026-01-31', 'project-1');
    expect(prisma.calendarEvent.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { profileId: 'profile-1', projectId: 'project-1', date: { gte: new Date('2026-01-01T00:00:00.000Z'), lte: new Date('2026-01-31T00:00:00.000Z') } },
    }));
  });

  it('rejects invalid time ranges and cross-profile event relations', async () => {
    expect(() => service.list('profile-1', '2026-02-01', '2026-01-01')).toThrow();
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(service.create('profile-1', { title: 'Meeting', eventType: 'Meeting', date: '2026-01-01', projectId: 'project-1' }))
      .rejects.toMatchObject({ status: 404 });
    expect(prisma.calendarEvent.create).not.toHaveBeenCalled();
  });

  it('creates all-day events with a full-day time range', async () => {
    prisma.calendarEvent.create.mockResolvedValue({ id: 'event-1' });
    await service.create('profile-1', { title: 'Shoot', eventType: 'Wedding', date: '2026-01-01', allDay: true });
    expect(prisma.calendarEvent.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({
      startTime: new Date('1970-01-01T00:00:00.000Z'), endTime: new Date('1970-01-01T23:59:00.000Z'),
    }) }));
  });
});
