import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginPayload, type RegisterPayload, type UserProfile } from '../../features/auth/api/auth.api';
import { getToken, removeToken, setToken } from '../../shared/utils/token';

type AuthContextValue = {
  currentUser: UserProfile | null;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const qc = useQueryClient();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    authApi
      .getMe()
      .then(setCurrentUser)
      .catch(() => removeToken())
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (payload: LoginPayload) => {
    const { token } = await authApi.login(payload);
    setToken(token);
    const user = await authApi.getMe();
    setCurrentUser(user);
  };

  const register = async (payload: RegisterPayload) => {
    const { token } = await authApi.register(payload);
    setToken(token);
    const user = await authApi.getMe();
    setCurrentUser(user);
  };

  const logout = () => {
    removeToken();
    setCurrentUser(null);
    qc.clear();
  };

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside AuthProvider');
  return ctx;
}
