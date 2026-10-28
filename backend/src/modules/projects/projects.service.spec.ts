import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectsService } from './projects.service.js';

describe('ProjectsService writes', () => {
  const prisma = {
    project: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    client: { findFirst: vi.fn() },
    package: { findFirst: vi.fn() },
  };
  const service = new ProjectsService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('refuses to create a project attached to another profile client', async () => {
    prisma.client.findFirst.mockResolvedValue(null);
    await expect(service.create('profile-1', { clientId: 'client-other', title: 'Wedding' }))
      .rejects.toMatchObject({ status: 400 });
    expect(prisma.project.create).not.toHaveBeenCalled();
  });
});
