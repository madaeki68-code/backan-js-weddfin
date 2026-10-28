import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(profileId: string) {
    return this.prisma.project.findMany({
      where: {
        profileId,
        deletedAt: null,
      },
      include: {
        client: true,
        package: true,
        teamAssignments: {
          include: {
            teamMember: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, profileId: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        profileId,
        deletedAt: null,
      },
      include: {
        client: true,
        package: true,
        teamAssignments: {
          include: {
            teamMember: true,
          },
        },
        transactions: true,
        gallery: true,
        feedbacks: true,
      },
    });

    if (!project) {
      throw new NotFoundException(`Project dengan ID ${id} tidak ditemukan`);
    }

    return project;
  }

  async create(profileId: string, dto: CreateProjectDto) {
    const client = await this.prisma.client.findFirst({ where: { id: dto.clientId, profileId }, select: { id: true } });
    if (!client) throw new BadRequestException('Client tidak ditemukan pada profil ini');
    if (dto.packageId && !await this.prisma.package.findFirst({ where: { id: dto.packageId, profileId }, select: { id: true } })) {
      throw new BadRequestException('Package tidak ditemukan pada profil ini');
    }
    return this.prisma.project.create({ data: {
      profileId, clientId: dto.clientId, packageId: dto.packageId, title: dto.title.trim(),
      eventDate: dto.eventDate ? new Date(dto.eventDate) : undefined, venueName: dto.venueName, venueCity: dto.venueCity,
      status: dto.status ?? 'confirmed', totalPackagePrice: dto.totalPackagePrice ?? 0,
      totalAddonPrice: dto.totalAddonPrice ?? 0, discountAmount: dto.discountAmount ?? 0,
      grandTotal: dto.grandTotal ?? 0, amountPaid: dto.amountPaid ?? 0, notes: dto.notes,
    } });
  }

  async update(id: string, profileId: string, dto: UpdateProjectDto) {
    await this.findOne(id, profileId);
    if (dto.clientId && !await this.prisma.client.findFirst({ where: { id: dto.clientId, profileId }, select: { id: true } })) {
      throw new BadRequestException('Client tidak ditemukan pada profil ini');
    }
    if (dto.packageId && !await this.prisma.package.findFirst({ where: { id: dto.packageId, profileId }, select: { id: true } })) {
      throw new BadRequestException('Package tidak ditemukan pada profil ini');
    }
    return this.prisma.project.update({ where: { id }, data: {
      ...(dto.clientId !== undefined && { clientId: dto.clientId }), ...(dto.packageId !== undefined && { packageId: dto.packageId || null }),
      ...(dto.title !== undefined && { title: dto.title.trim() }), ...(dto.eventDate !== undefined && { eventDate: dto.eventDate ? new Date(dto.eventDate) : null }),
      ...(dto.venueName !== undefined && { venueName: dto.venueName }), ...(dto.venueCity !== undefined && { venueCity: dto.venueCity }),
      ...(dto.status !== undefined && { status: dto.status }), ...(dto.totalPackagePrice !== undefined && { totalPackagePrice: dto.totalPackagePrice }),
      ...(dto.totalAddonPrice !== undefined && { totalAddonPrice: dto.totalAddonPrice }), ...(dto.discountAmount !== undefined && { discountAmount: dto.discountAmount }),
      ...(dto.grandTotal !== undefined && { grandTotal: dto.grandTotal }), ...(dto.amountPaid !== undefined && { amountPaid: dto.amountPaid }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    } });
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.project.update({ where: { id }, data: { deletedAt: new Date() } });
    return { message: 'Proyek berhasil dihapus' };
  }
}
