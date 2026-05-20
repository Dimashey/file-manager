const TOKEN_KEY = 'auth_token';

export const authStore = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string): void => { localStorage.setItem(TOKEN_KEY, token); },
  clearToken: (): void => { localStorage.removeItem(TOKEN_KEY); },
  isAuthenticated: (): boolean => Boolean(localStorage.getItem(TOKEN_KEY)),
};
