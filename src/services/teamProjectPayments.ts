import { TeamProjectPayment } from '../types';
import { apiRequest } from './apiClient';

type PaymentApiRow = Record<string, unknown>;
const isUuid = (value?: string) => Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value));

function fromRow(row: PaymentApiRow): TeamProjectPayment {
  const date = row.date instanceof Date ? row.date.toISOString() : String(row.date || '');
  return {
    id: String(row.id),
    projectId: String(row.projectId ?? row.project_id ?? ''),
    teamMemberName: String(row.teamMemberName ?? row.team_member_name ?? ''),
    teamMemberId: String(row.teamMemberId ?? row.team_member_id ?? ''),
    date: date.slice(0, 10),
    status: row.status === 'Paid' ? 'Paid' : 'Unpaid',
    fee: Number(row.fee || 0),
    createdAt: String(row.createdAt ?? row.created_at ?? date),
    updatedAt: row.updatedAt || row.updated_at ? String(row.updatedAt ?? row.updated_at) : undefined,
  };
}

function toApiItem(payment: TeamProjectPayment) {
  const date = payment.date?.trim();
  if (!date || Number.isNaN(Date.parse(date))) throw new Error('Tanggal acara wajib valid sebelum fee tim disimpan.');
  return {
    ...(isUuid(payment.id) ? { id: payment.id } : {}),
    teamMemberId: payment.teamMemberId,
    teamMemberName: payment.teamMemberName,
    date,
    status: payment.status,
    fee: Number(payment.fee),
  };
}

export async function listAllTeamPayments(): Promise<TeamProjectPayment[]> {
  return (await apiRequest<PaymentApiRow[]>('/team-project-payments')).map(fromRow);
}

export async function listTeamPaymentsByProject(projectId: string): Promise<TeamProjectPayment[]> {
  return (await apiRequest<PaymentApiRow[]>(`/team-project-payments/project/${encodeURIComponent(projectId)}`)).map(fromRow);
}

export async function upsertTeamPaymentsForProject(projectId: string, items: TeamProjectPayment[]): Promise<TeamProjectPayment[]> {
  const uniqueItems = new Map<string, TeamProjectPayment>();
  for (const item of Array.isArray(items) ? items : []) {
    if (item.teamMemberId && !uniqueItems.has(item.teamMemberId)) uniqueItems.set(item.teamMemberId, item);
  }
  const rows = await apiRequest<PaymentApiRow[]>(`/team-project-payments/project/${encodeURIComponent(projectId)}`, {
    method: 'PUT',
    body: JSON.stringify({ items: [...uniqueItems.values()].map(toApiItem) }),
  });
  return rows.map(fromRow);
}

export async function markTeamPaymentStatus(id: string, status: 'Paid' | 'Unpaid'): Promise<void> {
  await apiRequest(`/team-project-payments/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function updateTeamPaymentFee(id: string, fee: number, status: 'Paid' | 'Unpaid'): Promise<void> {
  await apiRequest(`/team-project-payments/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify({ fee, status }) });
}

export async function updateTeamProjectPayments(items: TeamProjectPayment[]): Promise<TeamProjectPayment[]> {
  const byProject = new Map<string, TeamProjectPayment[]>();
  for (const item of items) {
    const group = byProject.get(item.projectId) || [];
    group.push(item);
    byProject.set(item.projectId, group);
  }
  const groups = await Promise.all([...byProject].map(([projectId, payments]) => upsertTeamPaymentsForProject(projectId, payments)));
  return groups.flat();
}

export async function deleteTeamPaymentsByProject(projectId: string): Promise<void> {
  await apiRequest(`/team-project-payments/project/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
}

export const teamProjectPaymentService = {
  list: listAllTeamPayments,
  listByProject: listTeamPaymentsByProject,
  add: async (payment: TeamProjectPayment) => {
    if (!payment?.projectId) throw new Error('projectId is required to add a team project payment');
    return fromRow(await apiRequest<PaymentApiRow>(`/team-project-payments/project/${encodeURIComponent(payment.projectId)}`, {
      method: 'POST', body: JSON.stringify(toApiItem(payment)),
    }));
  },
  create: async (payment: TeamProjectPayment) => teamProjectPaymentService.add(payment),
  update: async (id: string, patch: Partial<TeamProjectPayment>) => fromRow(await apiRequest<PaymentApiRow>(`/team-project-payments/${encodeURIComponent(id)}`, {
    method: 'PATCH', body: JSON.stringify({ ...(patch.status !== undefined && { status: patch.status }), ...(patch.fee !== undefined && { fee: patch.fee }) }),
  })),
  delete: deleteTeamPaymentsByProject,
};
