import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axiosClient } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  axiosClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

describe('filesApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('list calls GET /files with optional folderId', async () => {
    const { filesApi } = await import('../api/files.api');
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: [] });

    await filesApi.list('folder-1');

    expect(axiosClient.get).toHaveBeenCalledWith('/files', { params: { folderId: 'folder-1' } });
  });

  it('upload calls POST /files/upload with FormData', async () => {
    const { filesApi } = await import('../api/files.api');
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { id: 'f-1' } });
    const file = new File(['content'], 'test.txt', { type: 'text/plain' });

    await filesApi.upload(file);

    const [url, body] = vi.mocked(axiosClient.post).mock.calls[0]!;
    expect(url).toBe('/files/upload');
    expect(body).toBeInstanceOf(FormData);
  });

  it('remove calls DELETE /files/:id', async () => {
    const { filesApi } = await import('../api/files.api');
    vi.mocked(axiosClient.delete).mockResolvedValueOnce({ data: undefined });

    await filesApi.remove('f-1');

    expect(axiosClient.delete).toHaveBeenCalledWith('/files/f-1');
  });
});
