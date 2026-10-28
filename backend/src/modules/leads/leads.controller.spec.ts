import { describe, expect, it, vi } from 'vitest';
import { LeadsController } from './leads.controller.js';

describe('LeadsController public inquiry', () => {
  it('limits repeated public submissions per profile and remote address', async () => {
    const service = { createPublic: vi.fn(async () => ({ id: 'lead' })) };
    const controller = new LeadsController(service as never);
    const profileId = `profile-${crypto.randomUUID()}`;
    const request = { ip: '192.0.2.1' };
    const dto = { name: 'Ayu', phone: '0812' } as never;

    for (let index = 0; index < 5; index += 1) {
      await controller.createPublic(profileId, dto, request);
    }

    await expect(controller.createPublic(profileId, dto, request))
      .rejects.toMatchObject({ status: 429 });
    expect(service.createPublic).toHaveBeenCalledTimes(5);
  });
});
