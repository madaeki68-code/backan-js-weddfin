import { beforeEach, describe, expect, it, vi } from 'vitest';
import { deleteGalleryImage, uploadImageAsset } from '../storage';

describe('Nest storage client', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('uploads an asset as multipart data without overriding the browser boundary', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ success: true, data: { url: 'http://localhost:4000/api/v1/storage/public/00000000-0000-4000-8000-000000000000' } }), { status: 201 }));
    const file = new File(['<svg xmlns="http://www.w3.org/2000/svg"></svg>'], 'logo.svg', { type: 'image/svg+xml' });

    await expect(uploadImageAsset(file, 'profile-assets')).resolves.toContain('/storage/public/');
    const [, options] = fetchSpy.mock.calls[0];
    expect(options?.credentials).toBe('include');
    expect(options?.body).toBeInstanceOf(FormData);
    expect(new Headers(options?.headers).has('Content-Type')).toBe(false);
  });

  it('deletes files created by Nest storage through the authenticated API', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));
    await deleteGalleryImage('http://localhost:4000/api/v1/storage/public/00000000-0000-4000-8000-000000000000');
    expect(fetchSpy).toHaveBeenCalledWith(expect.stringContaining('/storage/assets/00000000-0000-4000-8000-000000000000'), expect.objectContaining({
      method: 'DELETE', credentials: 'include',
    }));
  });
});
