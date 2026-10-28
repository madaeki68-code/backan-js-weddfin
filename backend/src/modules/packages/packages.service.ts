import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { Prisma } from '@prisma/client';
import { CreatePackageDto } from './dto/create-package.dto.js';
import { UpdatePackageDto } from './dto/update-package.dto.js';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(profileId: string, query: { search?: string; activeOnly?: boolean } = {}) {
    return this.prisma.package.findMany({
      where: {
        profileId,
        ...(query.activeOnly && { isActive: true }),
        ...(query.search?.trim() && { OR: [
          { name: { contains: query.search.trim(), mode: 'insensitive' } },
          { category: { contains: query.search.trim(), mode: 'insensitive' } },
        ] }),
      },
      orderBy: [{ category: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: string, profileId: string) {
    const record = await this.prisma.package.findFirst({ where: { id, profileId } });
    if (!record) throw new NotFoundException(`Paket ${id} tidak ditemukan`);
    return record;
  }

  create(profileId: string, dto: CreatePackageDto) {
    return this.prisma.package.create({
      data: {
        profileId,
        name: dto.name.trim(),
        category: dto.category?.trim() || 'Wedding',
        price: dto.price,
        description: dto.description,
        features: (dto.features ?? []) as Prisma.InputJsonValue,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async update(id: string, profileId: string, dto: UpdatePackageDto) {
    await this.findOne(id, profileId);
    return this.prisma.package.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.category !== undefined && { category: dto.category.trim() }),
        ...(dto.price !== undefined && { price: dto.price }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.features !== undefined && { features: dto.features as Prisma.InputJsonValue }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.package.delete({ where: { id } });
    return { message: 'Paket berhasil dihapus' };
  }
}
