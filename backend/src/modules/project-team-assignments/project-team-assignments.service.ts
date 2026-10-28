import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamRole } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateAssignmentDto } from './dto/create-assignment.dto.js';
import { UpdateAssignmentDto } from './dto/update-assignment.dto.js';

@Injectable()
export class ProjectTeamAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(profileId: string, projectId: string) {
    await this.requireProject(profileId, projectId);
    return this.prisma.projectTeamAssignment.findMany({
      where: { projectId }, include: { teamMember: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
    });
  }

  async create(profileId: string, dto: CreateAssignmentDto) {
    await this.requireProject(profileId, dto.projectId);
    await this.requireTeamMember(profileId, dto.teamMemberId);
    return this.prisma.projectTeamAssignment.create({ data: {
      projectId: dto.projectId, teamMemberId: dto.teamMemberId, assignedRole: mapRole(dto.assignedRole),
      agreedFee: dto.agreedFee ?? 0, isConfirmed: dto.isConfirmed ?? false, notes: dto.notes,
    }, include: { teamMember: true } });
  }

  async update(id: string, profileId: string, dto: UpdateAssignmentDto) {
    const current = await this.prisma.projectTeamAssignment.findFirst({
      where: { id, project: { profileId } }, select: { id: true, projectId: true },
    });
    if (!current) throw new NotFoundException(`Assignment ${id} tidak ditemukan`);
    if (dto.projectId) await this.requireProject(profileId, dto.projectId);
    if (dto.teamMemberId) await this.requireTeamMember(profileId, dto.teamMemberId);
    return this.prisma.projectTeamAssignment.update({ where: { id }, data: {
      ...(dto.projectId !== undefined && { projectId: dto.projectId }),
      ...(dto.teamMemberId !== undefined && { teamMemberId: dto.teamMemberId }),
      ...(dto.assignedRole !== undefined && { assignedRole: mapRole(dto.assignedRole) }),
      ...(dto.agreedFee !== undefined && { agreedFee: dto.agreedFee }),
      ...(dto.isConfirmed !== undefined && { isConfirmed: dto.isConfirmed }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    }, include: { teamMember: true } });
  }

  async remove(id: string, profileId: string) {
    const current = await this.prisma.projectTeamAssignment.findFirst({ where: { id, project: { profileId } }, select: { id: true } });
    if (!current) throw new NotFoundException(`Assignment ${id} tidak ditemukan`);
    await this.prisma.projectTeamAssignment.delete({ where: { id } });
    return { message: 'Assignment berhasil dihapus' };
  }

  private async requireProject(profileId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, profileId, deletedAt: null }, select: { id: true } });
    if (!project) throw new NotFoundException(`Proyek ${id} tidak ditemukan`);
    return project;
  }
  private async requireTeamMember(profileId: string, id: string) {
    const member = await this.prisma.teamMember.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!member) throw new NotFoundException(`Anggota tim ${id} tidak ditemukan`);
    return member;
  }
}

function mapRole(value: string): TeamRole {
  const role = value.toLowerCase();
  if (role.includes('foto')) return 'photographer';
  if (role.includes('video')) return 'videographer';
  if (role.includes('drone') || role.includes('pilot')) return 'pilot_drone';
  if (role.includes('edit')) return 'editor';
  return 'assistant';
}
