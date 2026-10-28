import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get(profileId: string) {
    const profile = await this.prisma.profile.findUnique({ where: { id: profileId } });
    if (!profile) throw new NotFoundException('Profil tidak ditemukan');
    return profile;
  }

  async update(profileId: string, dto: UpdateProfileDto) {
    await this.get(profileId);
    return this.prisma.profile.update({ where: { id: profileId }, data: {
      ...(dto.businessName !== undefined && { businessName: dto.businessName }),
      ...(dto.ownerName !== undefined && { ownerName: dto.ownerName }), ...(dto.phone !== undefined && { phone: dto.phone }),
      ...(dto.address !== undefined && { address: dto.address }), ...(dto.logoUrl !== undefined && { logoUrl: dto.logoUrl }),
      ...(dto.instagramHandle !== undefined && { instagramHandle: dto.instagramHandle }),
      ...(dto.websiteUrl !== undefined && { websiteUrl: dto.websiteUrl }),
      ...(dto.mobileUiScale !== undefined && { mobileUiScale: dto.mobileUiScale }),
      ...(dto.leadSources !== undefined && { leadSources: dto.leadSources as Prisma.InputJsonValue }),
    } });
  }
}
