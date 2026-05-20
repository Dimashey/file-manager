import { useQuery } from '@tanstack/react-query';
import { filesApi } from '../api/files.api';

export function useSearchFiles(query: string) {
  return useQuery({
    queryKey: ['files', 'search', query] as const,
    queryFn: () => filesApi.search(query),
    enabled: query.length >= 1,
  });
}
