import { useMutation } from '@tanstack/react-query';
import { useAuthContext } from '../../../app/providers/AuthProvider';
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth.api';

export const useCurrentUser = () => {
  const { currentUser, isLoading, logout } = useAuthContext();
  return { currentUser, isLoading, logout };
};

export const useLogin = () => {
  const { login } = useAuthContext();
  return useMutation({ mutationFn: (payload: LoginPayload) => login(payload) });
};

export const useRegister = () => {
  const { register } = useAuthContext();
  return useMutation({ mutationFn: (payload: RegisterPayload) => register(payload) });
};

export { authApi };
