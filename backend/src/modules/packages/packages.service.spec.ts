import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PackagesService } from './packages.service.js';

describe('PackagesService', () => {
  const prisma = { package: {
    findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn(),
  } };
  const service = new PackagesService(prisma as never);

  beforeEach(() => vi.clearAllMocks());

  it('scopes package reads to the authenticated profile', async () => {
    prisma.package.findMany.mockResolvedValue([]);
    await service.findAll('profile-1', { activeOnly: true, search: 'Wedding' });
    expect(prisma.package.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ profileId: 'profile-1', isActive: true }),
    }));
  });

  it('creates normalized package data with safe defaults', async () => {
    prisma.package.create.mockResolvedValue({ id: 'package-1' });
    await service.create('profile-1', { name: '  Basic  ', price: 100 });
    expect(prisma.package.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ profileId: 'profile-1', name: 'Basic', category: 'Wedding', features: [], isActive: true }),
    });
  });
});
