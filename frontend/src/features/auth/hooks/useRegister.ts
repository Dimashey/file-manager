import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { authApi } from '../api/auth.api';
import { authStore } from '../store/auth.store';
import type { RegisterPayload } from '../types/auth.types';

export function useRegister() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterPayload) => authApi.register(payload),
    onSuccess: ({ token }) => {
      authStore.setToken(token);
      qc.clear();
      navigate({ to: '/' });
    },
  });
}
