import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateFeedbackDto } from './dto/create-feedback.dto.js';
import { UpdateFeedbackDto } from './dto/update-feedback.dto.js';

@Injectable()
export class ClientFeedbackService {
  constructor(private readonly prisma: PrismaService) {}

  async list(profileId: string, projectId?: string) {
    return this.prisma.clientFeedback.findMany({
      where: { project: { profileId, ...(projectId && { id: projectId }) } },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
  }

  async create(profileId: string, dto: CreateFeedbackDto) {
    await this.requireProject(profileId, dto.projectId);
    return this.prisma.clientFeedback.create({ data: {
      projectId: dto.projectId, rating: dto.rating, comment: dto.comment, clientName: dto.clientName,
    } });
  }

  async update(id: string, profileId: string, dto: UpdateFeedbackDto) {
    await this.requireFeedback(id, profileId);
    return this.prisma.clientFeedback.update({ where: { id }, data: {
      ...(dto.rating !== undefined && { rating: dto.rating }), ...(dto.comment !== undefined && { comment: dto.comment }),
      ...(dto.clientName !== undefined && { clientName: dto.clientName }),
      ...(dto.isApprovedForTestimonial !== undefined && { isApprovedForTestimonial: dto.isApprovedForTestimonial }),
    } });
  }

  async remove(id: string, profileId: string) {
    await this.requireFeedback(id, profileId);
    await this.prisma.clientFeedback.delete({ where: { id } });
    return { message: 'Ulasan berhasil dihapus' };
  }

  private async requireProject(profileId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, profileId, deletedAt: null }, select: { id: true } });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan');
    return project;
  }
  private async requireFeedback(id: string, profileId: string) {
    const feedback = await this.prisma.clientFeedback.findFirst({ where: { id, project: { profileId } }, select: { id: true } });
    if (!feedback) throw new NotFoundException('Ulasan tidak ditemukan');
    return feedback;
  }
}
