import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createTeamPaymentRecord, listTeamPaymentRecords, updateTeamPaymentRecord } from '../teamPaymentRecords';

describe('team payment record Nest API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('normalizes records from the profile-scoped API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: [{
      id: 'record-1', recordNumber: 'PAY-001', teamMemberId: 'member-1', date: '2026-10-28T00:00:00.000Z',
      projectPaymentIds: [], totalAmount: '500000', vendorSignature: null,
    }] }), { status: 200 }));
    await expect(listTeamPaymentRecords()).resolves.toMatchObject([{ id: 'record-1', recordNumber: 'PAY-001', date: '2026-10-28', totalAmount: 500000 }]);
  });

  it('creates and updates payment records through NestJS', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (_input, init) => {
      const body = JSON.parse(String(init?.body));
      return new Response(JSON.stringify({ success: true, data: { id: 'record-1', ...body } }), { status: init?.method === 'POST' ? 201 : 200 });
    });
    const record = { recordNumber: 'PAY-001', teamMemberId: '00000000-0000-4000-8000-000000000001', date: '2026-10-28', projectPaymentIds: [] as string[], totalAmount: 500000 };
    await expect(createTeamPaymentRecord(record)).resolves.toMatchObject({ id: 'record-1', recordNumber: 'PAY-001' });
    await expect(updateTeamPaymentRecord('record-1', { totalAmount: 600000 })).resolves.toMatchObject({ totalAmount: 600000 });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy.mock.calls[0][1]?.credentials).toBe('include');
  });
});
