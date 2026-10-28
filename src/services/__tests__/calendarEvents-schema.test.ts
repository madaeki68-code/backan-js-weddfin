import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createCalendarEvent, deleteCalendarEvent, encodeProjectMeetingNotes, listCalendarEventsInRange, listProjectMeetings, parseProjectMeetingNotes } from '../calendarEvents';

describe('calendar event Nest API mapping', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('round-trips project meeting metadata in event notes', () => {
    const metadata = { projectId: 'project-1', kind: 'zoom' as const, zoomUrl: 'https://zoom.us/j/123', location: '', resultNotes: 'Setujui dekorasi' };
    expect(parseProjectMeetingNotes(encodeProjectMeetingNotes(metadata))).toEqual(metadata);
    expect(parseProjectMeetingNotes('Catatan agenda biasa')).toBeNull();
  });

  it('creates all-day events with the compatible team member and project fields', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: {
      id: 'event-1', title: 'Rapat tim', eventType: 'Internal', date: '2026-10-05T00:00:00.000Z',
      startTime: '1970-01-01T00:00:00.000Z', endTime: '1970-01-01T23:59:00.000Z', teamMemberId: 'member-1',
      projectId: 'project-1', location: 'Studio', notes: 'Persiapan', tasks: [], createdAt: '2026-10-05T00:00:00Z',
    } }), { status: 201 }));

    const event = await createCalendarEvent({
      title: 'Rapat tim', eventType: 'Internal', date: '2026-10-05', startAt: '2026-10-05T00:00:00',
      endAt: '2026-10-05T23:59:00', allDay: true, teamMemberId: 'member-1', projectId: 'project-1', location: 'Studio', notes: 'Persiapan', tasks: [],
    });
    const [, options] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(options?.body))).toMatchObject({ eventType: 'Internal', startAt: '00:00', endAt: '23:59', teamMemberId: 'member-1', projectId: 'project-1' });
    expect(event).toMatchObject({ id: 'event-1', date: '2026-10-05', allDay: true, teamMemberId: 'member-1' });
  });

  it('lists project meetings from a profile-scoped project filter', async () => {
    const metadata = { projectId: 'project-1', kind: 'regular' as const, zoomUrl: '', location: 'Studio', resultNotes: 'Konsep disetujui' };
    const row = { id: 'event-1', title: 'Meeting', eventType: 'Meeting', date: '2026-10-05T00:00:00.000Z', notes: encodeProjectMeetingNotes(metadata), createdAt: '2026-10-05T00:00:00Z' };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: [row] }), { status: 200 }));
    const result = await listProjectMeetings('project-1');
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/calendar/events?projectId=project-1'), expect.objectContaining({ credentials: 'include' }));
    expect(result[0].metadata).toEqual(metadata);
    await expect(listCalendarEventsInRange('2026-10-01', '2026-10-31')).resolves.toHaveLength(1);
  });

  it('deletes events through the authenticated API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await expect(deleteCalendarEvent('event-1')).resolves.toBeUndefined();
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/calendar/events/event-1'), expect.objectContaining({ method: 'DELETE' }));
  });
});
