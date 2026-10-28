import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectTeamAssignmentsService } from './project-team-assignments.service.js';

describe('ProjectTeamAssignmentsService', () => {
  const prisma = {
    project: { findFirst: vi.fn() },
    teamMember: { findFirst: vi.fn() },
    projectTeamAssignment: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  };
  const service = new ProjectTeamAssignmentsService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('rejects assignments to projects outside the authenticated profile', async () => {
    prisma.project.findFirst.mockResolvedValue(null);
    await expect(service.create('profile-1', {
      projectId: 'project-other', teamMemberId: 'member-1', assignedRole: 'Fotografer',
    })).rejects.toMatchObject({ status: 404 });
    expect(prisma.projectTeamAssignment.create).not.toHaveBeenCalled();
  });
});
