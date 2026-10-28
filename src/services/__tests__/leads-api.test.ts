import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiRequest } = vi.hoisted(() => ({ apiRequest: vi.fn() }));

vi.mock('../apiClient', () => ({ apiRequest }));

describe('leads API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads leads from NestJS and maps the legacy VENA contract', async () => {
    apiRequest.mockResolvedValue({
      leads: [{
        id: 'lead-1', name: 'Ayu & Bima', contactChannel: 'Instagram', location: 'Jakarta',
        status: 'follow_up', contactDate: '2026-10-01', notes: 'Hubungi lagi', whatsapp: '0812',
        address: 'Jakarta Selatan', eventDate: '2027-01-10', createdAt: '2026-10-01T00:00:00.000Z',
      }],
      total: 1,
    });

    const { listLeadsPaginated } = await import('../leads');
    const result = await listLeadsPaginated(1, 10, { status: 'Menunggu Follow Up' });

    expect(apiRequest).toHaveBeenCalledWith('/leads?page=1&limit=10&status=Menunggu+Follow+Up');
    expect(result.leads[0]).toMatchObject({
      id: 'lead-1', name: 'Ayu & Bima', contactChannel: 'Instagram',
      status: 'Menunggu Follow Up', date: '2026-10-01', whatsapp: '0812',
    });
    expect(result).toMatchObject({ total: 1, hasMore: false });
  });

  it('submits public inquiries to the profile-scoped public endpoint', async () => {
    apiRequest.mockResolvedValue({
      id: 'lead-public', name: 'Ayu', contactChannel: 'Website', location: 'Bandung',
      status: 'Sedang Diskusi', date: '2026-10-27', whatsapp: '62812',
    });
    const { createPublicLead } = await import('../leads');
    await createPublicLead('profile-1', {
      name: 'Ayu', contactChannel: 'Website' as any, location: 'Bandung', status: 'Sedang Diskusi' as any,
      date: '2026-10-27', whatsapp: '62812',
    });

    expect(apiRequest).toHaveBeenCalledWith('/leads/public/profile-1', expect.objectContaining({ method: 'POST' }));
  });

  it('routes authenticated create, update, and delete operations through the API', async () => {
    apiRequest.mockResolvedValue({
      id: 'lead-1', name: 'Ayu & Bima', contactChannel: 'WhatsApp', location: 'Jakarta',
      status: 'Dikonversi', date: '2026-10-27', whatsapp: '62812',
    });
    const { createLead, updateLead, deleteLead } = await import('../leads');
    const payload = {
      name: 'Ayu & Bima', contactChannel: 'WhatsApp' as any, location: 'Jakarta',
      status: 'Dikonversi' as any, date: '2026-10-27', whatsapp: '62812',
    };

    await createLead(payload);
    const createOptions = apiRequest.mock.calls[0][1] as RequestInit;
    expect(apiRequest.mock.calls[0][0]).toBe('/leads');
    expect(createOptions.method).toBe('POST');
    expect(JSON.parse(String(createOptions.body))).toMatchObject({ name: 'Ayu & Bima', phone: '62812', status: 'deal' });

    await updateLead('lead/1', { status: 'Menunggu Follow Up' as any });
    expect(apiRequest.mock.calls[1][0]).toBe('/leads/lead%2F1');
    expect(JSON.parse(String((apiRequest.mock.calls[1][1] as RequestInit).body))).toMatchObject({ status: 'follow_up' });

    await deleteLead('lead/1');
    expect(apiRequest.mock.calls[2]).toMatchObject(['/leads/lead%2F1', { method: 'DELETE' }]);
  });
});
