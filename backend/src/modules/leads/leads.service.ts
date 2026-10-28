import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { UpdateLeadDto } from './dto/update-lead.dto.js';
import { LeadStatus } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(profileId: string, query: {
    page?: number; limit?: number; offset?: number; search?: string; source?: string; city?: string;
    dateFrom?: string; dateTo?: string; status?: string; activeOnly?: boolean;
    eventDateFrom?: string; eventDateTo?: string;
  } = {}) {
    const page = Math.max(1, Math.floor(query.page || 1));
    const limit = [10, 20, 50, 100].includes(Number(query.limit)) ? Number(query.limit) : 10;
    const legacyStatus = mapLegacyStatus(query.status);
    const and: object[] = [];
    if (query.status?.toLowerCase() === 'dikonversi') {
      and.push({ OR: [
        { status: 'deal' },
        { notes: { contains: 'Dikonversi', mode: 'insensitive' as const } },
      ] });
    } else if (legacyStatus) {
      and.push({ status: legacyStatus });
    }
    if (query.activeOnly) and.push({ status: { in: ['contacted', 'follow_up'] as LeadStatus[] } });
    if (query.search?.trim()) {
      and.push({ OR: [
        { name: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { location: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { notes: { contains: query.search.trim(), mode: 'insensitive' as const } },
      ] });
    }
    const where = {
      profileId,
      ...(query.source && { contactChannel: query.source }),
      ...(query.city && { location: { contains: query.city, mode: 'insensitive' as const } }),
      ...((query.dateFrom || query.dateTo) && { contactDate: {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      } }),
      ...((query.eventDateFrom || query.eventDateTo) && { eventDate: {
        ...(query.eventDateFrom && { gte: new Date(query.eventDateFrom) }),
        ...(query.eventDateTo && { lte: new Date(query.eventDateTo) }),
      } }),
      ...(and.length > 0 && { AND: and }),
    };
    const skip = query.offset === undefined ? (page - 1) * limit : Math.max(0, Math.floor(query.offset));
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.lead.findMany({ where, orderBy: [{ contactDate: 'desc' }, { id: 'desc' }], skip, take: limit }),
      this.prisma.lead.count({ where }),
    ]);
    return { leads: rows.map(serializeLead), total };
  }

  async findOne(id: string, profileId: string) {
    const lead = await this.prisma.lead.findFirst({
      where: { id, profileId },
    });

    if (!lead) throw new NotFoundException(`Lead dengan ID ${id} tidak ditemukan`);
    return serializeLead(lead);
  }

  async create(profileId: string, dto: CreateLeadDto) {
    return this.prisma.lead.create({
      data: {
        profileId,
        name: dto.name,
        contactChannel: dto.contactChannel,
        location: dto.location,
        contactDate: dto.date ? new Date(dto.date) : undefined,
        whatsapp: dto.whatsapp,
        address: dto.address,
        phone: dto.phone,
        groomName: dto.groomName,
        brideName: dto.brideName,
        email: dto.email,
        eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined,
        eventLocation: dto.eventLocation,
        estimatedBudget: dto.estimatedBudget ?? 0,
        leadSource: dto.leadSource,
        status: dto.status ?? 'new',
        notes: dto.notes,
      },
    }).then(serializeLead);
  }

  async createPublic(profileId: string, dto: CreateLeadDto) {
    return this.create(profileId, dto);
  }

  async update(id: string, profileId: string, dto: UpdateLeadDto) {
    await this.findOne(id, profileId);

    return this.prisma.lead.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.contactChannel !== undefined && { contactChannel: dto.contactChannel }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.date !== undefined && { contactDate: new Date(dto.date) }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.groomName !== undefined && { groomName: dto.groomName }),
        ...(dto.brideName !== undefined && { brideName: dto.brideName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.eventDate !== undefined && { eventDate: new Date(dto.eventDate) }),
        ...(dto.eventLocation !== undefined && { eventLocation: dto.eventLocation }),
        ...(dto.estimatedBudget !== undefined && { estimatedBudget: dto.estimatedBudget }),
        ...(dto.leadSource !== undefined && { leadSource: dto.leadSource }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    }).then(serializeLead);
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.lead.delete({ where: { id } });
    return { message: 'Lead berhasil dihapus' };
  }
}

function mapLegacyStatus(value?: string): LeadStatus | undefined {
  if (!value) return undefined;
  switch (value.toLowerCase()) {
    case 'sedang diskusi': return 'contacted';
    case 'menunggu follow up': return 'follow_up';
    case 'dikonversi': return 'deal';
    case 'ditolak': return 'lost';
    default: return undefined;
  }
}

function serializeLead<T extends {
  status: LeadStatus; name: string; contactChannel: string | null; location: string | null;
  contactDate: Date; whatsapp: string | null; address: string | null;
}>(lead: T) {
  const status = lead.status === 'contacted' || lead.status === 'meeting_scheduled'
    ? 'Sedang Diskusi'
    : lead.status === 'follow_up' ? 'Menunggu Follow Up'
      : lead.status === 'deal' ? 'Dikonversi'
        : lead.status === 'lost' ? 'Ditolak' : lead.status;
  return {
    ...lead,
    status,
    date: lead.contactDate.toISOString().slice(0, 10),
    eventDate: 'eventDate' in lead && lead.eventDate instanceof Date ? lead.eventDate.toISOString().slice(0, 10) : undefined,
  };
}
