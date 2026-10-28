/**
 * Calendar Adapter
 * Wrapper untuk Calendar Events API
 */

import { apiClient, handleApiError } from '../api-client';
import { useNestJSForModule } from '../../config/features';

// ========== TYPES ==========

export interface CalendarEventDTO {
  id: string;
  title: string;
  eventType: string;
  date: string;
  startTime?: Date | null;
  endTime?: Date | null;
  projectId?: string | null;
  clientId?: string | null;
  teamMemberId?: string | null;
  vendorId?: string | null;
  location?: string | null;
  notes?: string | null;
  tasks: any[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCalendarEventInput {
  title: string;
  eventType: string;
  date: string;
  allDay?: boolean;
  startAt?: string; // Format: "HH:mm" or "HH:mm:ss"
  endAt?: string;
  projectId?: string | null;
  clientId?: string | null;
  teamMemberId?: string | null;
  vendorId?: string | null;
  location?: string;
  notes?: string;
  tasks?: any[];
}

export interface UpdateCalendarEventInput {
  title?: string;
  eventType?: string;
  date?: string;
  allDay?: boolean;
  startAt?: string;
  endAt?: string;
  projectId?: string | null;
  clientId?: string | null;
  teamMemberId?: string | null;
  vendorId?: string | null;
  location?: string;
  notes?: string;
  tasks?: any[];
}

export interface CalendarEventFilters {
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  projectId?: string;
}

// ========== CALENDAR EVENTS ==========

/**
 * List calendar events with optional filters
 */
export async function listCalendarEvents(
  filters: CalendarEventFilters = {}
): Promise<CalendarEventDTO[]> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      const params: Record<string, string> = {};
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;
      if (filters.projectId) params.projectId = filters.projectId;

      const data = await apiClient.get<CalendarEventDTO[]>('/calendar/events', { params });
      return data;
    } else {
      // TODO: Implement Supabase fallback
      throw new Error('Calendar Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error listing events:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Get events for a specific date
 */
export async function getEventsForDate(date: string): Promise<CalendarEventDTO[]> {
  return listCalendarEvents({ from: date, to: date });
}

/**
 * Get events for a date range
 */
export async function getEventsForDateRange(
  from: string,
  to: string
): Promise<CalendarEventDTO[]> {
  return listCalendarEvents({ from, to });
}

/**
 * Get events for a project
 */
export async function getEventsForProject(projectId: string): Promise<CalendarEventDTO[]> {
  return listCalendarEvents({ projectId });
}

/**
 * Get events for current month
 */
export async function getEventsForCurrentMonth(): Promise<CalendarEventDTO[]> {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return listCalendarEvents({
    from: firstDay.toISOString().split('T')[0],
    to: lastDay.toISOString().split('T')[0],
  });
}

/**
 * Create a calendar event
 */
export async function createCalendarEvent(
  input: CreateCalendarEventInput
): Promise<CalendarEventDTO> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      const data = await apiClient.post<CalendarEventDTO>('/calendar/events', input);
      return data;
    } else {
      throw new Error('Calendar Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error creating event:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(
  id: string,
  input: UpdateCalendarEventInput
): Promise<CalendarEventDTO> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      const data = await apiClient.patch<CalendarEventDTO>(`/calendar/events/${id}`, input);
      return data;
    } else {
      throw new Error('Calendar Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error updating event:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(id: string): Promise<void> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      await apiClient.delete(`/calendar/events/${id}`);
    } else {
      throw new Error('Calendar Supabase fallback not implemented');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error deleting event:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== CALENDAR FEED ==========

/**
 * Get ICS calendar feed URL (requires token)
 */
export function getCalendarFeedUrl(token: string): string {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
  return `${apiBaseUrl}/calendar/feed/${token}`;
}

/**
 * Generate new calendar feed token
 */
export async function generateCalendarFeedToken(): Promise<{ token: string; url: string }> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      const data = await apiClient.post<{ token: string }>('/calendar/feed/generate');
      return {
        token: data.token,
        url: getCalendarFeedUrl(data.token),
      };
    } else {
      throw new Error('Calendar feed not implemented for Supabase');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error generating feed token:', error);
    throw new Error(handleApiError(error));
  }
}

/**
 * Revoke calendar feed token
 */
export async function revokeCalendarFeedToken(): Promise<void> {
  const useNestJS = useNestJSForModule('calendar');

  try {
    if (useNestJS) {
      await apiClient.delete('/calendar/feed/revoke');
    } else {
      throw new Error('Calendar feed not implemented for Supabase');
    }
  } catch (error) {
    console.error('[Calendar Adapter] Error revoking feed token:', error);
    throw new Error(handleApiError(error));
  }
}

// ========== UTILITIES ==========

/**
 * Format time for API (HH:mm:ss)
 */
export function formatTimeForApi(hour: number, minute: number, second: number = 0): string {
  const h = hour.toString().padStart(2, '0');
  const m = minute.toString().padStart(2, '0');
  const s = second.toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/**
 * Parse time from API
 */
export function parseTimeFromApi(time: Date | string | null): { hour: number; minute: number } | null {
  if (!time) return null;

  const timeStr = typeof time === 'string' ? time : time.toISOString();
  const match = timeStr.match(/T?(\d{2}):(\d{2})/);

  if (match) {
    return {
      hour: parseInt(match[1], 10),
      minute: parseInt(match[2], 10),
    };
  }

  return null;
}

/**
 * Check if event is all-day
 */
export function isAllDayEvent(event: CalendarEventDTO): boolean {
  if (!event.startTime || !event.endTime) return true;

  const start = parseTimeFromApi(event.startTime);
  const end = parseTimeFromApi(event.endTime);

  if (!start || !end) return true;

  return start.hour === 0 && start.minute === 0 && end.hour === 23 && end.minute === 59;
}

/**
 * Get event duration in minutes
 */
export function getEventDuration(event: CalendarEventDTO): number | null {
  if (!event.startTime || !event.endTime) return null;

  const start = parseTimeFromApi(event.startTime);
  const end = parseTimeFromApi(event.endTime);

  if (!start || !end) return null;

  const startMinutes = start.hour * 60 + start.minute;
  const endMinutes = end.hour * 60 + end.minute;

  return endMinutes - startMinutes;
}

/**
 * Format event date for display (Indonesia locale)
 */
export function formatEventDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format event time for display
 */
export function formatEventTime(event: CalendarEventDTO): string {
  if (isAllDayEvent(event)) {
    return 'Sepanjang hari';
  }

  const start = parseTimeFromApi(event.startTime);
  const end = parseTimeFromApi(event.endTime);

  if (!start || !end) return 'Sepanjang hari';

  const formatTime = (t: { hour: number; minute: number }) =>
    `${t.hour.toString().padStart(2, '0')}:${t.minute.toString().padStart(2, '0')}`;

  return `${formatTime(start)} - ${formatTime(end)}`;
}

/**
 * Group events by date
 */
export function groupEventsByDate(
  events: CalendarEventDTO[]
): Map<string, CalendarEventDTO[]> {
  const grouped = new Map<string, CalendarEventDTO[]>();

  for (const event of events) {
    const dateKey = event.date;
    const existing = grouped.get(dateKey) || [];
    existing.push(event);
    grouped.set(dateKey, existing);
  }

  // Sort events within each date by start time
  for (const [date, eventsForDate] of grouped.entries()) {
    eventsForDate.sort((a, b) => {
      const aTime = parseTimeFromApi(a.startTime);
      const bTime = parseTimeFromApi(b.startTime);

      if (!aTime || !bTime) return 0;

      const aMinutes = aTime.hour * 60 + aTime.minute;
      const bMinutes = bTime.hour * 60 + bTime.minute;

      return aMinutes - bMinutes;
    });
  }

  return grouped;
}

/**
 * Check if date has events
 */
export function hasEventsOnDate(events: CalendarEventDTO[], date: string): boolean {
  return events.some((event) => event.date === date);
}

/**
 * Get event count for date
 */
export function getEventCountForDate(events: CalendarEventDTO[], date: string): number {
  return events.filter((event) => event.date === date).length;
}
