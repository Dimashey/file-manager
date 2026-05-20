import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axiosClient } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('foldersApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls GET /folders with optional parentId', async () => {
    const { foldersApi } = await import('../api/folders.api');
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: [] });

    await foldersApi.list('parent-1');

    expect(axiosClient.get).toHaveBeenCalledWith('/folders', { params: { parentId: 'parent-1' } });
  });

  it('create calls POST /folders', async () => {
    const { foldersApi } = await import('../api/folders.api');
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { id: 'f-1' } });

    await foldersApi.create({ name: 'Docs' });

    expect(axiosClient.post).toHaveBeenCalledWith('/folders', { name: 'Docs' });
  });

  it('remove calls DELETE /folders/:id', async () => {
    const { foldersApi } = await import('../api/folders.api');
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });

    await foldersApi.remove('f-1');

    expect(axiosClient.delete).toHaveBeenCalledWith('/folders/f-1');
  });
});
