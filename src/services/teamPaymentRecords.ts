import { TeamPaymentRecord } from '../types';
import { apiRequest } from './apiClient';
import { uploadImageDataUrl } from './storage';

type PaymentRecordApiRow = Record<string, unknown>;

function fromRow(row: PaymentRecordApiRow): TeamPaymentRecord {
  const date = row.date instanceof Date ? row.date.toISOString() : String(row.date || '');
  return {
    id: String(row.id),
    recordNumber: String(row.recordNumber ?? row.record_number ?? ''),
    teamMemberId: String(row.teamMemberId ?? row.team_member_id ?? ''),
    date: date.slice(0, 10),
    projectPaymentIds: Array.isArray(row.projectPaymentIds ?? row.project_payment_ids) ? (row.projectPaymentIds ?? row.project_payment_ids) as string[] : [],
    totalAmount: Number(row.totalAmount ?? row.total_amount ?? 0),
    vendorSignature: String(row.vendorSignature ?? row.vendor_signature ?? '') || undefined,
    createdAt: String(row.createdAt ?? row.created_at ?? date),
    updatedAt: row.updatedAt || row.updated_at ? String(row.updatedAt ?? row.updated_at) : undefined,
  };
}

async function prepareSignature<T extends { vendorSignature?: string }>(record: T): Promise<T> {
  if (!record.vendorSignature?.startsWith('data:image/')) return record;
  return { ...record, vendorSignature: await uploadImageDataUrl(record.vendorSignature, 'team-payment-signatures') };
}

export async function listTeamPaymentRecords(): Promise<TeamPaymentRecord[]> {
  return (await apiRequest<PaymentRecordApiRow[]>('/team-payment-records')).map(fromRow);
}

export async function createTeamPaymentRecord(payload: Omit<TeamPaymentRecord, 'id'>): Promise<TeamPaymentRecord> {
  const ready = await prepareSignature(payload);
  return fromRow(await apiRequest<PaymentRecordApiRow>('/team-payment-records', { method: 'POST', body: JSON.stringify(ready) }));
}

export async function updateTeamPaymentRecord(id: string, patch: Partial<TeamPaymentRecord>): Promise<TeamPaymentRecord> {
  const ready = await prepareSignature(patch);
  return fromRow(await apiRequest<PaymentRecordApiRow>(`/team-payment-records/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(ready) }));
}

export async function deleteTeamPaymentRecord(id: string): Promise<void> {
  await apiRequest(`/team-payment-records/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
