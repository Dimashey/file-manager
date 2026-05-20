import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '../api/folders.api';

export function useSearchFolders(query: string) {
  return useQuery({
    queryKey: ['folders', 'search', query] as const,
    queryFn: () => foldersApi.search(query),
    enabled: query.length >= 1,
  });
}
