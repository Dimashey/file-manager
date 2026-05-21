import api from '../../../lib/axios';

export type AuthTokenResponse = {
  token: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export const authApi = {
  login: (payload: LoginPayload) =>
    api.post<AuthTokenResponse>('/auth/login', payload).then((r) => r.data),

  register: (payload: RegisterPayload) =>
    api.post<AuthTokenResponse>('/auth/register', payload).then((r) => r.data),

  getMe: () => api.get<UserProfile>('/auth/me').then((r) => r.data),
};
