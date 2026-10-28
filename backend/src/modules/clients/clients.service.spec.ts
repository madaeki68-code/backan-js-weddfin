import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientsService } from './clients.service.js';

describe('ClientsService', () => {
  const prisma = {
    $transaction: vi.fn(),
    client: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };
  const service = new ClientsService(prisma as never);

  beforeEach(() => vi.clearAllMocks());

  it('filters client records by the authenticated profile and applies pagination', async () => {
    prisma.client.findMany.mockResolvedValue([{ id: 'client-1' }]);
    prisma.client.count.mockResolvedValue(1);
    prisma.$transaction.mockImplementation(async (operations: Promise<unknown>[]) => Promise.all(operations));

    await service.findAll('profile-1', { page: 2, limit: 10, search: 'Ayu' });

    expect(prisma.client.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        profileId: 'profile-1',
        OR: expect.arrayContaining([expect.objectContaining({ name: expect.any(Object) })]),
      }),
      skip: 10,
      take: 10,
    }));
  });

  it('creates a legacy-shaped client while preserving portal and status fields', async () => {
    prisma.client.create.mockResolvedValue({ id: 'client-1' });

    await service.create('profile-1', {
      name: 'Ayu & Bima', phone: '0812', whatsapp: '0812', status: 'Aktif',
      clientType: 'Langsung', portalAccessId: 'portal-1',
    });

    expect(prisma.client.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: 'profile-1', name: 'Ayu & Bima', groomName: 'Ayu & Bima', brideName: '',
        phone: '0812', portalAccessId: 'portal-1',
      }),
    });
  });
});
