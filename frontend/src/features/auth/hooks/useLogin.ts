import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../api/auth.api';
import { authStore } from '../store/auth.store';
import type { LoginPayload } from '../types/auth.types';

export function useLogin() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ token }) => {
      authStore.setToken(token);
      qc.clear();
      navigate({ to: '/' });
    },
  });
}
