import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateAddOnDto } from './dto/create-add-on.dto.js';
import { UpdateAddOnDto } from './dto/update-add-on.dto.js';

@Injectable()
export class AddOnsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(profileId: string, activeOnly = false) {
    return this.prisma.packageAddOn.findMany({
      where: { profileId, ...(activeOnly && { isActive: true }) },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
  }

  async findOne(id: string, profileId: string) {
    const item = await this.prisma.packageAddOn.findFirst({ where: { id, profileId } });
    if (!item) throw new NotFoundException(`Add-on ${id} tidak ditemukan`);
    return item;
  }

  create(profileId: string, dto: CreateAddOnDto) {
    return this.prisma.packageAddOn.create({ data: { profileId, ...dto, name: dto.name.trim(), isActive: dto.isActive ?? true } });
  }

  async update(id: string, profileId: string, dto: UpdateAddOnDto) {
    await this.findOne(id, profileId);
    return this.prisma.packageAddOn.update({
      where: { id },
      data: { ...dto, ...(dto.name !== undefined && { name: dto.name.trim() }) },
    });
  }

  async remove(id: string, profileId: string) {
    await this.findOne(id, profileId);
    await this.prisma.packageAddOn.delete({ where: { id } });
    return { message: 'Add-on berhasil dihapus' };
  }
}
