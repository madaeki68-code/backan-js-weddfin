import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, TeamProjectPayment } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service.js';
import { ReconcileTeamPaymentsDto, TeamProjectPaymentDto } from './dto/team-project-payment.dto.js';
import { CreateTeamPaymentRecordDto, TeamPaymentRecordDto } from './dto/team-payment-record.dto.js';

@Injectable()
export class TeamPaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(profileId: string) { return this.prisma.teamProjectPayment.findMany({ where: { profileId }, orderBy: [{ date: 'desc' }, { id: 'desc' }] }); }
  async listByProject(profileId: string, projectId: string) {
    await this.requireProject(profileId, projectId);
    return this.prisma.teamProjectPayment.findMany({ where: { profileId, projectId }, orderBy: { date: 'asc' } });
  }

  async createPayment(profileId: string, projectId: string, item: TeamProjectPaymentDto) {
    await this.requireProject(profileId, projectId);
    await this.requireTeamMember(profileId, item.teamMemberId);
    return this.prisma.teamProjectPayment.create({ data: { profileId, projectId, ...paymentData(item, item.status) } });
  }

  async reconcile(profileId: string, projectId: string, { items }: ReconcileTeamPaymentsDto) {
    await this.requireProject(profileId, projectId);
    const memberIds = [...new Set(items.map(item => item.teamMemberId).filter(Boolean))];
    if (memberIds.length) {
      const members = await this.prisma.teamMember.findMany({ where: { id: { in: memberIds }, profileId }, select: { id: true } });
      if (members.length !== memberIds.length) throw new NotFoundException('Anggota tim tidak ditemukan');
    }
    return this.prisma.$transaction(async tx => {
      const existing = await tx.teamProjectPayment.findMany({ where: { profileId, projectId } });
      const remaining = [...existing];
      const incomingByMember = new Map<string, TeamProjectPaymentDto>();
      for (const item of items) if (item.teamMemberId && !incomingByMember.has(item.teamMemberId)) incomingByMember.set(item.teamMemberId, item);
      const incoming = [...incomingByMember.values()];
      const output: TeamProjectPayment[] = [];

      for (const item of incoming) {
        const matchIndex = remaining.findIndex(row => row.id === item.id || row.teamMemberId === item.teamMemberId);
        const match = matchIndex >= 0 ? remaining.splice(matchIndex, 1)[0] : undefined;
        const reusableIndex = match ? -1 : remaining.findIndex(row => row.status !== 'Paid');
        const reusable = reusableIndex >= 0 ? remaining.splice(reusableIndex, 1)[0] : undefined;
        const prior = match ?? reusable;
        const row = prior
          ? await tx.teamProjectPayment.update({ where: { id: prior.id }, data: paymentData(item, prior.status === 'Paid' ? 'Paid' : item.status) })
          : await tx.teamProjectPayment.create({ data: { profileId, projectId, ...paymentData(item, item.status) } });
        output.push(row);
      }

      const unpaidIds = remaining.filter(row => row.status !== 'Paid').map(row => row.id);
      if (unpaidIds.length) await tx.teamProjectPayment.deleteMany({ where: { profileId, projectId, id: { in: unpaidIds } } });
      output.push(...remaining.filter(row => row.status === 'Paid'));
      return output;
    });
  }

  async updatePayment(profileId: string, id: string, patch: { status?: 'Paid' | 'Unpaid'; fee?: number }) {
    const current = await this.prisma.teamProjectPayment.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!current) throw new NotFoundException('Pembayaran tim tidak ditemukan');
    return this.prisma.teamProjectPayment.update({ where: { id }, data: patch });
  }

  async deleteProjectPayments(profileId: string, projectId: string) {
    await this.requireProject(profileId, projectId);
    await this.prisma.teamProjectPayment.deleteMany({ where: { profileId, projectId } });
    return { message: 'Pembayaran proyek dihapus' };
  }

  listRecords(profileId: string) { return this.prisma.teamPaymentRecord.findMany({ where: { profileId }, orderBy: [{ date: 'desc' }, { id: 'desc' }] }); }
  async createRecord(profileId: string, dto: CreateTeamPaymentRecordDto) {
    await this.validateRecordRelations(profileId, dto);
    return this.prisma.teamPaymentRecord.create({ data: recordData(profileId, dto, true) });
  }
  async updateRecord(profileId: string, id: string, dto: TeamPaymentRecordDto) {
    await this.requireRecord(profileId, id);
    await this.validateRecordRelations(profileId, dto);
    return this.prisma.teamPaymentRecord.update({ where: { id }, data: recordData(profileId, dto, false) });
  }
  async deleteRecord(profileId: string, id: string) {
    await this.requireRecord(profileId, id);
    await this.prisma.teamPaymentRecord.delete({ where: { id } });
    return { message: 'Bukti pembayaran tim dihapus' };
  }

  private async requireProject(profileId: string, id: string) {
    const project = await this.prisma.project.findFirst({ where: { id, profileId, deletedAt: null }, select: { id: true } });
    if (!project) throw new NotFoundException('Proyek tidak ditemukan');
  }
  private async requireTeamMember(profileId: string, id: string) {
    const member = await this.prisma.teamMember.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!member) throw new NotFoundException('Anggota tim tidak ditemukan');
  }
  private async requireRecord(profileId: string, id: string) {
    const record = await this.prisma.teamPaymentRecord.findFirst({ where: { id, profileId }, select: { id: true } });
    if (!record) throw new NotFoundException('Bukti pembayaran tim tidak ditemukan');
  }
  private async validateRecordRelations(profileId: string, dto: TeamPaymentRecordDto) {
    if (dto.teamMemberId && !await this.prisma.teamMember.findFirst({ where: { id: dto.teamMemberId, profileId }, select: { id: true } })) {
      throw new NotFoundException('Anggota tim tidak ditemukan');
    }
    if (dto.projectPaymentIds?.length) {
      const rows = await this.prisma.teamProjectPayment.findMany({ where: { id: { in: dto.projectPaymentIds }, profileId }, select: { id: true } });
      if (rows.length !== new Set(dto.projectPaymentIds).size) throw new NotFoundException('Sebagian pembayaran proyek tidak ditemukan');
    }
  }
}

function paymentData(item: TeamProjectPaymentDto, status: string) {
  return { teamMemberId: item.teamMemberId, teamMemberName: item.teamMemberName, date: new Date(`${item.date.slice(0, 10)}T00:00:00.000Z`), fee: item.fee, status };
}

function recordData(profileId: string, dto: TeamPaymentRecordDto, create: true): Prisma.TeamPaymentRecordUncheckedCreateInput;
function recordData(profileId: string, dto: TeamPaymentRecordDto, create: false): Prisma.TeamPaymentRecordUncheckedUpdateInput;
function recordData(profileId: string, dto: TeamPaymentRecordDto, create: boolean): Prisma.TeamPaymentRecordUncheckedCreateInput | Prisma.TeamPaymentRecordUncheckedUpdateInput {
  return {
    ...(create ? { profileId, recordNumber: dto.recordNumber!, date: new Date(`${dto.date!.slice(0, 10)}T00:00:00.000Z`), projectPaymentIds: (dto.projectPaymentIds ?? []) as Prisma.InputJsonValue, totalAmount: dto.totalAmount! } : {}),
    ...(dto.recordNumber !== undefined && { recordNumber: dto.recordNumber }),
    ...(dto.teamMemberId !== undefined && { teamMemberId: dto.teamMemberId || null }),
    ...(dto.date !== undefined && { date: new Date(`${dto.date.slice(0, 10)}T00:00:00.000Z`) }),
    ...(dto.projectPaymentIds !== undefined && { projectPaymentIds: dto.projectPaymentIds as Prisma.InputJsonValue }),
    ...(dto.totalAmount !== undefined && { totalAmount: dto.totalAmount }),
    ...(dto.vendorSignature !== undefined && { vendorSignature: dto.vendorSignature || null }),
  };
}
