import { axiosClient } from '@/lib/axios';
import type { AuthToken, LoginPayload, RegisterPayload, UserProfile } from '../types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthToken> => {
    const { data } = await axiosClient.post<AuthToken>('/auth/login', payload);
    return data;
  },
  register: async (payload: RegisterPayload): Promise<AuthToken> => {
    const { data } = await axiosClient.post<AuthToken>('/auth/register', payload);
    return data;
  },
  me: async (): Promise<UserProfile> => {
    const { data } = await axiosClient.get<UserProfile>('/auth/me');
    return data;
  },
};
