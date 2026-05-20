import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axiosClient } from '@/lib/axios';

vi.mock('@/lib/axios', () => ({
  axiosClient: { post: vi.fn(), get: vi.fn() },
}));

describe('authApi', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('login posts to /auth/login and returns token', async () => {
    const { authApi } = await import('../api/auth.api');
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { token: 'tok' } });

    const result = await authApi.login({ email: 'a@b.com', password: 'pw' });

    expect(axiosClient.post).toHaveBeenCalledWith('/auth/login', { email: 'a@b.com', password: 'pw' });
    expect(result).toEqual({ token: 'tok' });
  });

  it('register posts to /auth/register and returns token', async () => {
    const { authApi } = await import('../api/auth.api');
    vi.mocked(axiosClient.post).mockResolvedValueOnce({ data: { token: 'tok' } });

    const result = await authApi.register({ email: 'a@b.com', password: 'pw', name: 'A' });

    expect(axiosClient.post).toHaveBeenCalledWith('/auth/register', { email: 'a@b.com', password: 'pw', name: 'A' });
    expect(result).toEqual({ token: 'tok' });
  });

  it('me calls GET /auth/me and returns user profile', async () => {
    const { authApi } = await import('../api/auth.api');
    const user = { id: '1', email: 'a@b.com', name: 'A', createdAt: '', updatedAt: '' };
    vi.mocked(axiosClient.get).mockResolvedValueOnce({ data: user });

    const result = await authApi.me();

    expect(axiosClient.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(user);
  });
});
