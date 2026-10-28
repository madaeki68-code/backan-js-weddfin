import { CalendarEvent } from '../types';
import { apiRequest } from './apiClient';

const PROJECT_MEETING_NOTE_PREFIX = '[weddfin-project-meeting:v1]';

export type ProjectMeetingKind = 'regular' | 'zoom';

export type ProjectMeetingMetadata = {
  projectId: string;
  kind: ProjectMeetingKind;
  zoomUrl: string;
  location: string;
  resultNotes: string;
};

type CalendarEventRow = {
  id: string;
  title: string;
  event_type: string;
  date: string;
  start_time?: string | null;
  end_time?: string | null;
  team?: { memberId?: string }[] | null;
  location?: string | null;
  notes?: string | null;
  tasks?: { id: string; name: string; completed: boolean }[] | null;
  created_at: string;
  updated_at?: string;
};

function formatEventDateTime(date: string, time: string | null | undefined, fallback: string): string {
  const normalizedTime = time?.match(/(\d{2}:\d{2})/)?.[1] || fallback;
  return `${date}T${normalizedTime}:00`;
}

function getTimeValue(value: string): string {
  return value.match(/T(\d{2}:\d{2})/)?.[1] || value.match(/^(\d{2}:\d{2})/)?.[1] || value;
}

function toCalendarEvent(row: CalendarEventRow): CalendarEvent {
  const raw = row as CalendarEventRow & Record<string, any>;
  const date = String(raw.date || '').slice(0, 10);
  const startTime = raw.start_time || raw.startTime || undefined;
  const endTime = raw.end_time || raw.endTime || undefined;
  const teamMemberId = raw.teamMemberId || raw.team_member_id || raw.team?.[0]?.memberId;
  const allDay = !startTime && !endTime
    || getTimeValue(startTime || '') === '00:00' && getTimeValue(endTime || '') === '23:59';

  return {
    id: row.id,
    title: row.title,
    eventType: (raw.event_type ?? raw.eventType) as CalendarEvent['eventType'],
    status: 'Confirmed' as CalendarEvent['status'],
    date,
    startAt: formatEventDateTime(date, startTime, '00:00'),
    endAt: formatEventDateTime(date, endTime, '23:59'),
    allDay,
    teamMemberId,
    location: row.location || undefined,
    notes: row.notes || undefined,
    tasks: row.tasks || undefined,
    createdAt: raw.created_at || raw.createdAt,
    updatedAt: raw.updated_at || raw.updatedAt || raw.created_at || raw.createdAt,
  };
}

export function normalizeCalendarEvent(row: any): CalendarEvent {
  return toCalendarEvent(row as CalendarEventRow);
}

export function encodeProjectMeetingNotes(metadata: ProjectMeetingMetadata): string {
  return `${PROJECT_MEETING_NOTE_PREFIX}${JSON.stringify(metadata)}`;
}

export function parseProjectMeetingNotes(notes?: string): ProjectMeetingMetadata | null {
  if (!notes?.startsWith(PROJECT_MEETING_NOTE_PREFIX)) return null;

  try {
    const value = JSON.parse(notes.slice(PROJECT_MEETING_NOTE_PREFIX.length)) as Partial<ProjectMeetingMetadata>;
    if (
      typeof value.projectId !== 'string'
      || (value.kind !== 'regular' && value.kind !== 'zoom')
      || typeof value.zoomUrl !== 'string'
      || typeof value.location !== 'string'
      || typeof value.resultNotes !== 'string'
    ) {
      console.error('[Calendar][project_meeting] invalid meeting metadata');
      return null;
    }
    return value as ProjectMeetingMetadata;
  } catch (error) {
    console.error('[Calendar][project_meeting] failed to parse meeting metadata:', error);
    return null;
  }
}

export type ProjectMeeting = {
  event: CalendarEvent;
  metadata: ProjectMeetingMetadata;
};

export async function listProjectMeetings(projectId: string): Promise<ProjectMeeting[]> {
  const query = new URLSearchParams({ projectId });
  const data = await apiRequest<CalendarEventRow[]>(`/calendar/events?${query}`);
  return data
    .map(toCalendarEvent)
    .flatMap(event => {
      const metadata = parseProjectMeetingNotes(event.notes);
      return metadata?.projectId === projectId ? [{ event, metadata }] : [];
    });
}

export async function listCalendarEvents(): Promise<CalendarEvent[]> {
  return (await apiRequest<CalendarEventRow[]>('/calendar/events')).map(toCalendarEvent);
}

export async function listCalendarEventsInRange(fromDate: string, toDate: string): Promise<CalendarEvent[]> {
  const query = new URLSearchParams({ from: fromDate, to: toDate });
  return (await apiRequest<CalendarEventRow[]>(`/calendar/events?${query}`)).map(toCalendarEvent);
}

export type CreateCalendarEventInput = {
  title: string;
  eventType: string;
  date: string;
  startAt: string;
  endAt: string;
  allDay: boolean;
  projectId?: string;
  clientId?: string;
  teamMemberId?: string;
  vendorId?: string;
  location?: string;
  notes?: string;
  tasks?: { id: string; name: string; completed: boolean }[];
};

function toApiPayload(input: Partial<CreateCalendarEventInput>) {
  const payload: Record<string, unknown> = {};

  if (input.title !== undefined) payload.title = input.title;
  if (input.eventType !== undefined) payload.eventType = input.eventType;
  if (input.date !== undefined) payload.date = input.date;
  if (input.allDay === true) {
    payload.startAt = '00:00';
    payload.endAt = '23:59';
  } else {
    if (input.startAt !== undefined) payload.startAt = input.startAt;
    if (input.endAt !== undefined) payload.endAt = input.endAt;
  }
  if (input.projectId !== undefined) payload.projectId = input.projectId || null;
  if (input.clientId !== undefined) payload.clientId = input.clientId || null;
  if (input.teamMemberId !== undefined) payload.teamMemberId = input.teamMemberId || null;
  if (input.vendorId !== undefined) payload.vendorId = input.vendorId || null;
  if (input.location !== undefined) payload.location = input.location;
  if (input.notes !== undefined) payload.notes = input.notes;
  if (input.tasks !== undefined) payload.tasks = input.tasks;

  return payload;
}

export async function createCalendarEvent(input: CreateCalendarEventInput): Promise<CalendarEvent> {
  const data = await apiRequest<CalendarEventRow>('/calendar/events', { method: 'POST', body: JSON.stringify(toApiPayload(input)) });
  return toCalendarEvent(data);
}

export type UpdateCalendarEventInput = Partial<CreateCalendarEventInput>;

export async function updateCalendarEvent(id: string, input: UpdateCalendarEventInput): Promise<CalendarEvent> {
  const data = await apiRequest<CalendarEventRow>(`/calendar/events/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(toApiPayload(input)) });
  return toCalendarEvent(data);
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  await apiRequest(`/calendar/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
