import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileSettingsService } from './profile-settings.service.js';

describe('ProfileSettingsService', () => {
  const prisma = {
    profileSetting: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
  };
  const service = new ProfileSettingsService(prisma as never);

  beforeEach(() => vi.clearAllMocks());

  it('scopes listing and upserts to the profile and setting key', async () => {
    prisma.profileSetting.findMany.mockResolvedValue([]);
    prisma.profileSetting.upsert.mockResolvedValue({ id: 'setting-1' });

    await service.list('profile-1');
    await service.upsert('profile-1', 'theme.mode', 'dark');

    expect(prisma.profileSetting.findMany).toHaveBeenCalledWith({
      where: { profileId: 'profile-1' },
      orderBy: { key: 'asc' },
    });
    expect(prisma.profileSetting.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { profileId_key: { profileId: 'profile-1', key: 'theme.mode' } },
      create: { profileId: 'profile-1', key: 'theme.mode', value: 'dark' },
      update: { value: 'dark' },
    }));
  });

  it('rejects malformed keys and oversized JSON values', async () => {
    await expect(service.get('profile-1', '../secret')).rejects.toMatchObject({ status: 400 });
    await expect(service.upsert('profile-1', 'theme', 'x'.repeat(65 * 1024)))
      .rejects.toMatchObject({ status: 400 });
    expect(prisma.profileSetting.upsert).not.toHaveBeenCalled();
  });

  it('returns not found for a missing key and deletes an existing profile setting', async () => {
    prisma.profileSetting.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'setting-1', profileId: 'profile-1', key: 'theme' });
    prisma.profileSetting.delete.mockResolvedValue({});

    await expect(service.get('profile-1', 'theme')).rejects.toMatchObject({ status: 404 });
    await expect(service.remove('profile-1', 'theme')).resolves.toEqual({ message: 'Setting berhasil dihapus' });
    expect(prisma.profileSetting.delete).toHaveBeenCalledWith({ where: { id: 'setting-1' } });
  });
});
