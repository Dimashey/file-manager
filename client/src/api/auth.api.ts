import api from './axios';

export interface AuthTokenResponse {
  token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokenResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthTokenResponse>('/auth/register', payload).then((r) => r.data),

  getMe: () => api.get<UserProfile>('/auth/me').then((r) => r.data),
};
