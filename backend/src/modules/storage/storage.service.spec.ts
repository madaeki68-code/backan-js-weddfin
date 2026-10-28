import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { StorageService } from './storage.service.js';

describe('StorageService', () => {
  let root: string;
  const prisma = { storedAsset: { create: vi.fn(), findFirst: vi.fn(), delete: vi.fn() } };
  const service = () => new StorageService(prisma as never, {
    get: (key: string) => key === 'STORAGE_DIRECTORY' ? root : 'http://localhost:4000/api/v1',
  } as never);

  beforeAll(async () => { root = await mkdtemp(join(tmpdir(), 'attera-storage-')); });
  afterAll(async () => rm(root, { recursive: true, force: true }));
  beforeEach(() => vi.clearAllMocks());

  it('stores accepted uploads and keeps proof files private', async () => {
    prisma.storedAsset.create.mockImplementation(async ({ data }) => ({ ...data, sizeBytes: BigInt(data.sizeBytes) }));
    const result = await service().upload('profile-1', {
      originalname: '../proof.pdf', mimetype: 'application/pdf', size: 5, buffer: Buffer.from('%PDF-'),
    }, 'dp-proofs');
    expect(result.url).toMatch(/^http:\/\/localhost:4000\/api\/v1\/storage\/assets\//);
    expect(prisma.storedAsset.create.mock.calls[0][0].data).toMatchObject({
      profileId: 'profile-1', folder: 'dp-proofs', originalName: '.._proof.pdf', isPublic: false,
    });
    const stored = await readFile(join(root, prisma.storedAsset.create.mock.calls[0][0].data.storageKey));
    expect(stored.toString()).toBe('%PDF-');
  });

  it('publishes only approved asset folders and rejects unsupported or oversized uploads', async () => {
    prisma.storedAsset.create.mockImplementation(async ({ data }) => ({ ...data, sizeBytes: BigInt(data.sizeBytes) }));
    const result = await service().upload('profile-1', {
      originalname: 'cover.png', mimetype: 'image/png', size: 8, buffer: Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    }, 'package-covers');
    expect(result.url).toContain('/storage/public/');
    const vendorAsset = await service().upload('profile-1', {
      originalname: 'banner.svg', mimetype: 'image/svg+xml', size: 11, buffer: Buffer.from('<svg></svg>'),
    }, 'vendor/page-banner');
    expect(vendorAsset.url).toContain('/storage/public/');
    await expect(service().upload('profile-1', {
      originalname: 'bad.exe', mimetype: 'application/octet-stream', size: 2, buffer: Buffer.from('no'),
    })).rejects.toMatchObject({ status: 400 });
    await expect(service().upload('profile-1', {
      originalname: 'spoofed.png', mimetype: 'image/png', size: 4, buffer: Buffer.from('text'),
    })).rejects.toMatchObject({ status: 400 });
    await expect(service().upload('profile-1', {
      originalname: 'large.png', mimetype: 'image/png', size: 10 * 1024 * 1024 + 1, buffer: Buffer.from('x'),
    })).rejects.toMatchObject({ status: 400 });
  });

  it('scopes private file reads to the profile and hides private files from public reads', async () => {
    prisma.storedAsset.findFirst.mockResolvedValueOnce(null);
    await expect(service().readPrivate('asset-1', 'other-profile')).rejects.toMatchObject({ status: 404 });
    expect(prisma.storedAsset.findFirst).toHaveBeenCalledWith({ where: { id: 'asset-1', profileId: 'other-profile', isPublic: false } });
  });
});
