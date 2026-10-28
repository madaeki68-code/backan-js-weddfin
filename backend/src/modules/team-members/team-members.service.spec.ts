import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TeamMembersService } from './team-members.service.js';

describe('TeamMembersService', () => {
  const prisma = { teamMember: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } };
  const service = new TeamMembersService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('retains the original role label and maps known roles to the database enum', async () => {
    prisma.teamMember.create.mockResolvedValue({
      role: 'photographer', legacyRole: 'Fotografer', rating: 4.5, performanceNotes: [], status: 'Aktif',
    });
    const result = await service.create('profile-1', { name: 'Ayu', role: 'Fotografer', phone: '0812' });
    expect(prisma.teamMember.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ profileId: 'profile-1', role: 'photographer', legacyRole: 'Fotografer' }),
    });
    expect(result.role).toBe('Fotografer');
  });
});
