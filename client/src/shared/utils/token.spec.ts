import { describe, it, expect, beforeEach } from 'vitest';
import { getToken, setToken, removeToken } from './token';

describe('token utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should return null when no token is stored', () => {
    expect(getToken()).toBeNull();
  });

  it('should correctly store a token in localStorage', () => {
    setToken('test-token-123');
    expect(localStorage.getItem('fm_token')).toBe('test-token-123');
  });

  it('should retrieve the stored token from localStorage', () => {
    localStorage.setItem('fm_token', 'stored-token-abc');
    expect(getToken()).toBe('stored-token-abc');
  });

  it('should remove the token from localStorage', () => {
    localStorage.setItem('fm_token', 'delete-me');
    expect(localStorage.getItem('fm_token')).toBe('delete-me');

    removeToken();
    expect(localStorage.getItem('fm_token')).toBeNull();
    expect(getToken()).toBeNull();
  });
});
