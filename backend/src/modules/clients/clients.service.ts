import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateClientDto } from './dto/create-client.dto.js';
import { UpdateClientDto } from './dto/update-client.dto.js';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(profileId: string, query: {
    page?: number; limit?: number; offset?: number; search?: string; status?: string;
    clientType?: string; city?: string; dateFrom?: string; dateTo?: string; sortBy?: string;
  } = {}) {
    const page = Math.max(1, Math.floor(query.page || 1));
    const limit = [10, 20, 50, 100].includes(Number(query.limit)) ? Number(query.limit) : 10;
    const where = {
      profileId,
      ...(query.status && { status: query.status }),
      ...(query.clientType && { clientType: query.clientType }),
      ...(query.city && { address: { contains: query.city, mode: 'insensitive' as const } }),
      ...((query.dateFrom || query.dateTo) && { since: {
        ...(query.dateFrom && { gte: new Date(query.dateFrom) }),
        ...(query.dateTo && { lte: new Date(query.dateTo) }),
      } }),
      ...(query.search?.trim() && { OR: [
        { name: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { email: { contains: query.search.trim(), mode: 'insensitive' as const } },
        { phone: { contains: query.search.trim(), mode: 'insensitive' as const } },
      ] }),
    };
    const orderBy = query.sortBy === 'name' ? [{ name: 'asc' as const }, { id: 'asc' as const }]
      : query.sortBy === 'status' ? [{ status: 'asc' as const }, { since: 'desc' as const }]
        : [{ since: 'desc' as const }, { id: 'desc' as const }];
    const skip = query.offset === undefined ? (page - 1) * limit : Math.max(0, Math.floor(query.offset));
    const [clients, total] = await this.prisma.$transaction([
      this.prisma.client.findMany({
      where, skip, take: limit, orderBy,
      include: {
        projects: {
          select: { id: true, title: true, status: true, eventDate: true },
          orderBy: { eventDate: 'desc' },
        },
      },
      }),
      this.prisma.client.count({ where }),
    ]);
    return { clients, total };
  }

  async findOne(id: string, profileId: string) {
    const client = await this.prisma.client.findFirst({
      where: { id, profileId },
      include: {
        projects: {
          include: {
            package: true,
            teamAssignments: { include: { teamMember: true } },
          },
          orderBy: { eventDate: 'desc' },
        },
      },
    });

    if (!client) throw new NotFoundException(`Client dengan ID ${id} tidak ditemukan`);
    return client;
  }

  async create(profileId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        profileId,
        name: dto.name,
        groomName: dto.groomName ?? dto.name,
        brideName: dto.brideName ?? '',
        phone: dto.phone ?? dto.whatsapp ?? '',
        whatsapp: dto.whatsapp,
        email: dto.email,
        instagram: dto.instagram,
        address: dto.address,
        avatarUrl: dto.avatarUrl,
        status: dto.status ?? 'Aktif',
        clientType: dto.clientType ?? 'Langsung',
        since: dto.since ? new Date(dto.since) : undefined,
        lastContact: dto.lastContact ? new Date(dto.lastContact) : undefined,
        portalAccessId: dto.portalAccessId,
        homeAddress: dto.homeAddress,
      },
    });
  }

  async update(id: string, profileId: string, dto: UpdateClientDto) {
    await this.findOne(id, profileId);

    return this.prisma.client.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.groomName !== undefined && { groomName: dto.groomName }),
        ...(dto.brideName !== undefined && { brideName: dto.brideName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.instagram !== undefined && { instagram: dto.instagram }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.whatsapp !== undefined && { whatsapp: dto.whatsapp }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.clientType !== undefined && { clientType: dto.clientType }),
        ...(dto.since !== undefined && { since: new Date(dto.since) }),
        ...(dto.lastContact !== undefined && { lastContact: new Date(dto.lastContact) }),
        ...(dto.portalAccessId !== undefined && { portalAccessId: dto.portalAccessId }),
        ...(dto.homeAddress !== undefined && { homeAddress: dto.homeAddress }),
      },
    });
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.client.delete({ where: { id } });
    return { message: 'Client berhasil dihapus' };
  }
}
