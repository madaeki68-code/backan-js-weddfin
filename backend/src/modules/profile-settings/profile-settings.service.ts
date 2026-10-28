import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';

const MAX_SETTING_BYTES = 64 * 1024;
const SETTING_KEY_PATTERN = /^[a-zA-Z0-9._:-]{1,120}$/;

@Injectable()
export class ProfileSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  list(profileId: string) {
    return this.prisma.profileSetting.findMany({ where: { profileId }, orderBy: { key: 'asc' } });
  }

  async get(profileId: string, key: string) {
    const safeKey = validateKey(key);
    const setting = await this.prisma.profileSetting.findUnique({ where: { profileId_key: { profileId, key: safeKey } } });
    if (!setting) throw new NotFoundException(`Setting ${safeKey} tidak ditemukan`);
    return setting;
  }

  async upsert(profileId: string, key: string, value: unknown) {
    const safeKey = validateKey(key);
    const serialized = JSON.stringify(value);
    if (serialized === undefined || Buffer.byteLength(serialized, 'utf8') > MAX_SETTING_BYTES) {
      throw new BadRequestException('Nilai setting tidak valid atau terlalu besar');
    }
    const jsonValue = value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
    return this.prisma.profileSetting.upsert({
      where: { profileId_key: { profileId, key: safeKey } },
      create: { profileId, key: safeKey, value: jsonValue },
      update: { value: jsonValue },
    });
  }

  async remove(profileId: string, key: string) {
    const setting = await this.get(profileId, key);
    await this.prisma.profileSetting.delete({ where: { id: setting.id } });
    return { message: 'Setting berhasil dihapus' };
  }
}

function validateKey(key: string) {
  if (!SETTING_KEY_PATTERN.test(key)) throw new BadRequestException('Key setting tidak valid');
  return key;
}
