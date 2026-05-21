import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { notify } from '../shared/utils/notify';

const extractMessage = (error: unknown): string => {
  if (isAxiosError(error)) return error.response?.data?.message ?? error.message;
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
}

export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
  mutationCache: new MutationCache({
    onError: (error) => notify.error(extractMessage(error)),
  }),
  queryCache: new QueryCache({
    onError: (error) => notify.error(extractMessage(error)),
  }),
});
