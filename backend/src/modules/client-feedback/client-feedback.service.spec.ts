import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ClientFeedbackService } from './client-feedback.service.js';

describe('ClientFeedbackService', () => {
  const prisma = { project: { findFirst: vi.fn() }, clientFeedback: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() } };
  const service = new ClientFeedbackService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('requires the feedback project to belong to the authenticated profile', async () => {
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(service.create('profile-1', { projectId: 'project-other', rating: 5 }))
      .rejects.toMatchObject({ status: 404 });
    expect(prisma.clientFeedback.create).not.toHaveBeenCalled();
  });
});
