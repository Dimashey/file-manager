import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { authStore } from '../store/auth.store';

vi.mock('../api/auth.api', () => ({
  authApi: {
    login: vi.fn().mockResolvedValue({ token: 'tok' }),
    register: vi.fn().mockResolvedValue({ token: 'tok' }),
    me: vi.fn().mockResolvedValue({ id: '1', email: 'a@b.com', name: 'A', createdAt: '', updatedAt: '' }),
  },
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return React.createElement(QueryClientProvider, { client: qc }, children);
}

describe('useLogin', () => {
  beforeEach(() => { authStore.clearToken(); vi.clearAllMocks(); });

  it('stores token in localStorage on success', async () => {
    const { useLogin } = await import('../hooks/useLogin');
    const { result } = renderHook(() => useLogin(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: 'a@b.com', password: 'pw' });
    });

    expect(authStore.getToken()).toBe('tok');
  });
});

describe('useRegister', () => {
  beforeEach(() => { authStore.clearToken(); vi.clearAllMocks(); });

  it('stores token in localStorage on success', async () => {
    const { useRegister } = await import('../hooks/useRegister');
    const { result } = renderHook(() => useRegister(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ email: 'a@b.com', password: 'pw', name: 'A' });
    });

    expect(authStore.getToken()).toBe('tok');
  });
});
