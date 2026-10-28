import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CalendarEventDto, CreateCalendarEventDto } from './dto/calendar-event.dto.js';

@Injectable()
export class CalendarService {
  constructor(private readonly prisma: PrismaService) {}

  list(profileId: string, from?: string, to?: string, projectId?: string) {
    if (from && to && from > to) throw new BadRequestException('Rentang tanggal tidak valid');
    return this.prisma.calendarEvent.findMany({
      where: { profileId, ...(projectId && { projectId }), ...(from || to ? { date: { ...(from && { gte: new Date(`${from}T00:00:00.000Z`) }), ...(to && { lte: new Date(`${to}T00:00:00.000Z`) }) } } : {}) },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async create(profileId: string, dto: CreateCalendarEventDto) {
    await this.validateRelations(profileId, dto);
    return this.prisma.calendarEvent.create({ data: this.toData(profileId, dto, true) });
  }

  async update(id: string, profileId: string, dto: CalendarEventDto) {
    await this.requireEvent(id, profileId);
    await this.validateRelations(profileId, dto);
    return this.prisma.calendarEvent.update({ where: { id }, data: this.toData(profileId, dto, false) });
  }

  async remove(id: string, profileId: string) {
    await this.requireEvent(id, profileId);
    await this.prisma.calendarEvent.delete({ where: { id } });
    return { message: 'Event berhasil dihapus' };
  }

  private async validateRelations(profileId: string, dto: CalendarEventDto) {
    if (dto.projectId && !await this.prisma.project.findFirst({ where: { id: dto.projectId, profileId, deletedAt: null }, select: { id: true } })) {
      throw new NotFoundException('Proyek tidak ditemukan');
    }
    if (dto.clientId && !await this.prisma.client.findFirst({ where: { id: dto.clientId, profileId }, select: { id: true } })) {
      throw new NotFoundException('Klien tidak ditemukan');
    }
    if (dto.teamMemberId && !await this.prisma.teamMember.findFirst({ where: { id: dto.teamMemberId, profileId }, select: { id: true } })) {
      throw new NotFoundException('Anggota tim tidak ditemukan');
    }
  }

  private async requireEvent(id: string, profileId: string) {
    const event = await this.prisma.calendarEvent.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!event) throw new NotFoundException('Event tidak ditemukan');
  }

  private toData(profileId: string, dto: CreateCalendarEventDto, creating: true): Prisma.CalendarEventUncheckedCreateInput;
  private toData(profileId: string, dto: CalendarEventDto, creating: false): Prisma.CalendarEventUncheckedUpdateInput;
  private toData(profileId: string, dto: CalendarEventDto, creating: boolean): Prisma.CalendarEventUncheckedCreateInput | Prisma.CalendarEventUncheckedUpdateInput {
    const data: Prisma.CalendarEventUncheckedCreateInput = { profileId, title: dto.title!, eventType: dto.eventType!, date: new Date(`${dto.date}T00:00:00.000Z`) };
    const result: Prisma.CalendarEventUncheckedUpdateInput = creating ? data : {};
    if (dto.title !== undefined) result.title = dto.title;
    if (dto.eventType !== undefined) result.eventType = dto.eventType;
    if (dto.date !== undefined) result.date = new Date(`${dto.date}T00:00:00.000Z`);
    if (dto.allDay === true) {
      result.startTime = new Date('1970-01-01T00:00:00.000Z');
      result.endTime = new Date('1970-01-01T23:59:00.000Z');
    } else {
      if (dto.startAt !== undefined) result.startTime = dto.startAt ? parseTime(dto.startAt) : null;
      if (dto.endAt !== undefined) result.endTime = dto.endAt ? parseTime(dto.endAt) : null;
    }
    if (dto.projectId !== undefined) result.projectId = dto.projectId || null;
    if (dto.clientId !== undefined) result.clientId = dto.clientId || null;
    if (dto.teamMemberId !== undefined) result.teamMemberId = dto.teamMemberId || null;
    if (dto.vendorId !== undefined) result.vendorId = dto.vendorId || null;
    if (dto.location !== undefined) result.location = dto.location || null;
    if (dto.notes !== undefined) result.notes = dto.notes || null;
    if (dto.tasks !== undefined) result.tasks = dto.tasks as Prisma.InputJsonValue;
    return result;
  }
}

function parseTime(value: string) {
  const match = value.match(/(?:T|^)(\d{2}):(\d{2})(?::(\d{2}))?/);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59 || Number(match[3] ?? 0) > 59) {
    throw new BadRequestException('Waktu event tidak valid');
  }
  return new Date(`1970-01-01T${match[1]}:${match[2]}:${match[3] ?? '00'}.000Z`);
}
