import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TeamRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateTeamMemberDto } from './dto/create-team-member.dto.js';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto.js';

@Injectable()
export class TeamMembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(profileId: string, query: { search?: string; activeOnly?: boolean } = {}) {
    const rows = await this.prisma.teamMember.findMany({
      where: {
        profileId,
        ...(query.activeOnly && { isActive: true }),
        ...(query.search?.trim() && { OR: [
          { name: { contains: query.search.trim(), mode: 'insensitive' } },
          { phone: { contains: query.search.trim() } },
          { email: { contains: query.search.trim(), mode: 'insensitive' } },
        ] }),
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    return rows.map(serialize);
  }

  async findOne(id: string, profileId: string) {
    const row = await this.prisma.teamMember.findFirst({ where: { id, profileId } });
    if (!row) throw new NotFoundException(`Anggota tim ${id} tidak ditemukan`);
    return serialize(row);
  }

  async create(profileId: string, dto: CreateTeamMemberDto) {
    const row = await this.prisma.teamMember.create({
      data: {
        profileId, name: dto.name.trim(), role: toDbRole(dto.role), legacyRole: dto.role,
        phone: dto.phone, email: dto.email, standardFee: dto.standardFee ?? 0,
        avatarUrl: dto.avatarUrl, noRek: dto.noRek, bankName: dto.bankName,
        specialization: dto.specialization, location: dto.location, emergencyContact: dto.emergencyContact,
        rating: dto.rating ?? 0, performanceNotes: (dto.performanceNotes ?? []) as Prisma.InputJsonValue,
        portalAccessId: dto.portalAccessId, category: dto.category ?? 'Tim',
        status: dto.status ?? (dto.isActive === false ? 'Nonaktif' : 'Aktif'),
        isActive: dto.isActive ?? dto.status !== 'Nonaktif',
      },
    });
    return serialize(row);
  }

  async update(id: string, profileId: string, dto: UpdateTeamMemberDto) {
    await this.findOne(id, profileId);
    const row = await this.prisma.teamMember.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.role !== undefined && { role: toDbRole(dto.role), legacyRole: dto.role }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.standardFee !== undefined && { standardFee: dto.standardFee }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.noRek !== undefined && { noRek: dto.noRek }),
        ...(dto.bankName !== undefined && { bankName: dto.bankName }),
        ...(dto.specialization !== undefined && { specialization: dto.specialization }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.emergencyContact !== undefined && { emergencyContact: dto.emergencyContact }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.performanceNotes !== undefined && { performanceNotes: dto.performanceNotes as Prisma.InputJsonValue }),
        ...(dto.portalAccessId !== undefined && { portalAccessId: dto.portalAccessId }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.status !== undefined && { status: dto.status, isActive: dto.status !== 'Nonaktif' }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive, status: dto.isActive ? 'Aktif' : 'Nonaktif' }),
      },
    });
    return serialize(row);
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.teamMember.delete({ where: { id } });
    return { message: 'Anggota tim berhasil dihapus' };
  }
}

function toDbRole(role: string): TeamRole {
  const value = role.toLowerCase();
  if (value.includes('foto')) return 'photographer';
  if (value.includes('video')) return 'videographer';
  if (value.includes('drone') || value.includes('pilot')) return 'pilot_drone';
  if (value.includes('edit')) return 'editor';
  if (value.includes('assistant') || value.includes('asisten')) return 'assistant';
  return 'assistant';
}

function serialize<T extends { role: TeamRole; legacyRole: string | null; rating: Prisma.Decimal; performanceNotes: Prisma.JsonValue; status: string }>(row: T) {
  return { ...row, role: row.legacyRole || row.role, rating: Number(row.rating), performanceNotes: row.performanceNotes, status: row.status };
}
