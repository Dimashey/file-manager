import { useQuery } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { authStore } from '../store/auth.store';

export const currentUserQueryKey = ['auth', 'me'] as const;

export function useCurrentUser() {
  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: authApi.me,
    enabled: authStore.isAuthenticated(),
  });
}
