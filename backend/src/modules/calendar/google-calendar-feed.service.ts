import { createHash, randomBytes } from 'node:crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class GoogleCalendarFeedService {
  private readonly apiBaseUrl: string;
  constructor(private readonly prisma: PrismaService, config: ConfigService) {
    this.apiBaseUrl = (config.get('PUBLIC_API_URL') || 'http://localhost:4000/api/v1').replace(/\/$/, '');
  }

  async manage(profileId: string, userId: string, role: string, action: 'status' | 'create' | 'revoke') {
    assertAdmin(role);
    if (action === 'status') return { active: Boolean(await this.prisma.googleCalendarFeedToken.findUnique({ where: { profileId }, select: { id: true } })) };
    if (action === 'revoke') {
      await this.prisma.googleCalendarFeedToken.deleteMany({ where: { profileId } });
      return { active: false };
    }
    const token = randomBytes(32).toString('hex');
    const tokenHash = hashToken(token);
    await this.prisma.googleCalendarFeedToken.upsert({
      where: { profileId },
      create: { profileId, tokenHash, createdBy: userId },
      update: { tokenHash, createdBy: userId },
    });
    return { active: true, url: `${this.apiBaseUrl}/calendar/google-feed/feed?token=${token}` };
  }

  async feed(token: string) {
    if (!/^[a-f0-9]{64}$/.test(token)) throw new NotFoundException('Calendar feed tidak ditemukan');
    const feed = await this.prisma.googleCalendarFeedToken.findUnique({ where: { tokenHash: hashToken(token) } });
    if (!feed) throw new NotFoundException('Calendar feed tidak ditemukan');
    const [projects, events] = await Promise.all([
      this.prisma.project.findMany({
        where: { profileId: feed.profileId, deletedAt: null },
        include: { client: true, teamAssignments: { include: { teamMember: true } } },
      }),
      this.prisma.calendarEvent.findMany({ where: { profileId: feed.profileId }, include: { teamMember: true }, orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }),
    ]);
    return buildCalendarFeed(projects, events);
  }
}

function assertAdmin(role: string) {
  if (!['admin', 'superadmin', 'Admin', 'SuperAdmin'].includes(role)) throw new ForbiddenException('Akses admin diperlukan');
}

function hashToken(token: string) { return createHash('sha256').update(token).digest('hex'); }
function escapeIcs(value: unknown) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/\r\n?/g, '\n').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
function dateOnly(value: Date | null | undefined) { return value ? value.toISOString().slice(0, 10).replace(/-/g, '') : ''; }
function timeOnly(value: Date | null | undefined) { return value ? value.toISOString().slice(11, 16) : ''; }
function utcDateTime(date: Date, time: string) {
  const parsed = new Date(`${date.toISOString().slice(0, 10)}T${time}:00+07:00`);
  return formatUtcDateTime(parsed);
}
function formatUtcDateTime(value: Date) { return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z'); }
function foldLine(line: string) {
  let result = '';
  let chunk = '';
  let limit = 75;
  for (const character of line) {
    if (Buffer.byteLength(chunk + character, 'utf8') > limit) {
      result += `${chunk}\r\n `;
      chunk = character;
      limit = 74;
    } else chunk += character;
  }
  return result + chunk;
}

function eventLines(input: { id: string; title: string; date: Date; startTime?: Date | null; endTime?: Date | null; location?: string | null; description?: string }) {
  const date = dateOnly(input.date);
  if (!date) return [];
  const timed = Boolean(input.startTime);
  const startTime = timed ? utcDateTime(input.date, timeOnly(input.startTime)) : date;
  let endTime = '';
  if (timed) {
    const parsedStart = new Date(`${input.date.toISOString().slice(0, 10)}T${timeOnly(input.startTime)}:00+07:00`);
    if (input.endTime) {
      const end = timeOnly(input.endTime);
      const crossesMidnight = end < timeOnly(input.startTime);
      const endDate = crossesMidnight ? new Date(input.date.getTime() + 24 * 60 * 60 * 1000) : input.date;
      endTime = utcDateTime(endDate, end);
    } else {
      endTime = formatUtcDateTime(new Date(parsedStart.getTime() + 60 * 60 * 1000));
    }
  } else {
    const next = new Date(`${input.date.toISOString().slice(0, 10)}T00:00:00.000Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    endTime = dateOnly(next);
  }
  return [
    'BEGIN:VEVENT', `UID:${escapeIcs(input.id)}@vena-attera`, `DTSTAMP:${formatUtcDateTime(new Date())}`,
    timed ? `DTSTART:${startTime}` : `DTSTART;VALUE=DATE:${startTime}`,
    timed ? `DTEND:${endTime}` : `DTEND;VALUE=DATE:${endTime}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    ...(input.location ? [`LOCATION:${escapeIcs(input.location)}`] : []),
    ...(input.description ? [`DESCRIPTION:${escapeIcs(input.description)}`] : []),
    'END:VEVENT',
  ];
}

export function buildCalendarFeed(projects: any[], events: any[]) {
  const entries = [
    ...projects.flatMap(project => project.eventDate ? [{
      id: project.id,
      title: project.title || 'Acara',
      date: project.eventDate,
      location: project.venueName || project.venueCity,
      description: [project.client?.name, project.status, project.notes, ...(project.teamAssignments || []).map((assignment: any) => assignment.teamMember?.name)].filter(Boolean).join('\n'),
    }] : []),
    ...events.map(event => ({
      id: event.id, title: event.title, date: event.date, startTime: event.startTime, endTime: event.endTime,
      location: event.location, description: [event.eventType, event.teamMember?.name, event.notes].filter(Boolean).join('\n'),
    })),
  ];
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//VENA ATTERA//Calendar Feed//ID', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...entries.flatMap(event => eventLines(event)), 'END:VCALENDAR'];
  return `${lines.map(foldLine).join('\r\n')}\r\n`;
}
