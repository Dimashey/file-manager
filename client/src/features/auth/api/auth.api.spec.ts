import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authApi } from './auth.api';
import api from '../../../lib/axios';

vi.mock('../../../lib/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
    },
  };
});

describe('auth.api', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should call login with correct payload and return token', async () => {
    const payload = { email: 'user@example.com', password: 'password123' };
    const mockResponse = { token: 'token-abc-123' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await authApi.login(payload);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/login', payload);
    expect(result).toEqual(mockResponse);
  });

  it('should call register with correct payload and return token', async () => {
    const payload = { email: 'new@example.com', password: 'securePassword', name: 'New User' };
    const mockResponse = { token: 'new-token-456' };
    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await authApi.register(payload);

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith('/auth/register', payload);
    expect(result).toEqual(mockResponse);
  });

  it('should fetch current user profile information', async () => {
    const mockProfile = {
      id: 'usr-1',
      email: 'me@example.com',
      name: 'John Doe',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    };
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockProfile });

    const result = await authApi.getMe();

    expect(api.get).toHaveBeenCalledTimes(1);
    expect(api.get).toHaveBeenCalledWith('/auth/me');
    expect(result).toEqual(mockProfile);
  });
});
