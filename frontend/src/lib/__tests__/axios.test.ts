import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('axiosClient', () => {
  beforeEach(() => { localStorage.clear(); });
  afterEach(() => { vi.resetModules(); });

  it('exports get and post methods', async () => {
    const { axiosClient } = await import('../axios');
    expect(typeof axiosClient.get).toBe('function');
    expect(typeof axiosClient.post).toBe('function');
  });

  it('registers a request interceptor', async () => {
    const { axiosClient } = await import('../axios');
    const handlers = (axiosClient.interceptors.request as any).handlers;
    expect(handlers.length).toBeGreaterThan(0);
  });
});
