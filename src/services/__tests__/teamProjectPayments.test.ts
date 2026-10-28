import { beforeEach, describe, expect, it, vi } from 'vitest';
import { updateTeamProjectPayments, upsertTeamPaymentsForProject } from '../teamProjectPayments';

describe('team project payment Nest API', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('rejects a blank fee date before making an API request', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    await expect(updateTeamProjectPayments([{
      id: '4d44d2ac-97bb-4cb3-9f61-26a3608719e1', projectId: 'project-1', teamMemberName: 'Ayu',
      teamMemberId: '4d44d2ac-97bb-4cb3-9f61-26a3608719e1', date: '', status: 'Unpaid', fee: 500000,
    }])).rejects.toThrow('Tanggal acara wajib valid');
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('reconciles an assignment without losing the paid history returned by the API', async () => {
    const newRow = {
      id: '833adf4e-611e-45a2-80bb-86f08edc5911', projectId: 'project-1', teamMemberId: 'member-new',
      teamMemberName: 'Bima', date: '2026-10-13', status: 'Unpaid', fee: 750000,
    };
    const paidRow = {
      id: '4d44d2ac-97bb-4cb3-9f61-26a3608719e1', projectId: 'project-1', teamMemberId: 'member-old',
      teamMemberName: 'Ayu', date: '2026-10-13', status: 'Paid', fee: 500000,
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: [newRow, paidRow] }), { status: 200 }));

    const result = await upsertTeamPaymentsForProject('project-1', [newRow as any]);
    const [, options] = fetchSpy.mock.calls[0];
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/team-project-payments/project/project-1'), expect.objectContaining({ method: 'PUT' }));
    expect(JSON.parse(String(options?.body))).toMatchObject({ items: [{ teamMemberId: 'member-new', fee: 750000 }] });
    expect(result.map(payment => payment.status)).toEqual(['Unpaid', 'Paid']);
    expect(result[1].teamMemberId).toBe('member-old');
  });

  it('sends only the first entry for duplicate team member assignments', async () => {
    const firstRow = {
      id: '4d44d2ac-97bb-4cb3-9f61-26a3608719e1', projectId: 'project-1', teamMemberName: 'Ayu',
      teamMemberId: '4d44d2ac-97bb-4cb3-9f61-26a3608719e1', date: '2026-10-13', status: 'Unpaid' as const, fee: 500000,
    };
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: [] }), { status: 200 }));
    await upsertTeamPaymentsForProject('project-1', [firstRow, { ...firstRow, fee: 750000 }]);
    const [, options] = fetchSpy.mock.calls[0];
    expect(JSON.parse(String(options?.body)).items).toEqual([expect.objectContaining({ fee: 500000 })]);
  });
});
