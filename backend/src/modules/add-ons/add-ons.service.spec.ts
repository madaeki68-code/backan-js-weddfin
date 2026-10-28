import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AddOnsService } from './add-ons.service.js';

describe('AddOnsService', () => {
  const prisma = { packageAddOn: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } };
  const service = new AddOnsService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('always scopes add-on queries to the current profile', async () => {
    prisma.packageAddOn.findMany.mockResolvedValue([]);
    await service.findAll('profile-1', true);
    expect(prisma.packageAddOn.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { profileId: 'profile-1', isActive: true } }));
  });
});
