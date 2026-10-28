import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { PrismaService } from '../../database/prisma.service.js';

describe('UsersService access control', () => {
  const prisma = {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  };
  const service = new UsersService(prisma as unknown as PrismaService);

  beforeEach(() => vi.clearAllMocks());

  it('denies listing user accounts to non-superadmin roles', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'crew', isActive: true });

    await expect(service.getAllUsers('user-1')).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.user.findMany).not.toHaveBeenCalled();
  });

  it('allows a superadmin to list safe user summaries', async () => {
    prisma.user.findUnique.mockResolvedValue({ role: 'superadmin', isActive: true });
    prisma.user.findMany.mockResolvedValue([{ id: 'user-2', email: 'staff@example.com' }]);

    await expect(service.getAllUsers('admin-1')).resolves.toEqual([
      { id: 'user-2', email: 'staff@example.com' },
    ]);
    expect(prisma.user.findMany).toHaveBeenCalledOnce();
  });
});
