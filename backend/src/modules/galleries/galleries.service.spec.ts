import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GalleriesService } from './galleries.service.js';

describe('GalleriesService public access', () => {
  const prisma = { gallery: { findMany: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    galleryItem: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    project: { findFirst: vi.fn() } };
  const service = new GalleriesService(prisma as never);
  beforeEach(() => vi.clearAllMocks());

  it('does not reveal a protected gallery or increment views when its code is wrong', async () => {
    prisma.gallery.findFirst.mockResolvedValue({ id: 'gallery-1', accessCode: 'secret-code' });
    await expect(service.findPublic('sample', 'wrong-code')).rejects.toMatchObject({ status: 403 });
    expect(prisma.gallery.update).not.toHaveBeenCalled();
  });

  it('omits the access code from the public response', async () => {
    prisma.gallery.findFirst.mockResolvedValue({ id: 'gallery-1', accessCode: 'secret-code', isPublished: true, items: [] });
    prisma.gallery.update.mockResolvedValue({});
    const result = await service.findPublic('sample', 'secret-code');
    expect(result).toMatchObject({ id: 'gallery-1', isPublished: true });
    expect(result).not.toHaveProperty('accessCode');
  });
});
