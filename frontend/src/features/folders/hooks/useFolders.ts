import { useQuery } from '@tanstack/react-query';
import { foldersApi } from '../api/folders.api';

export const foldersQueryKey = (parentId?: string) => ['folders', parentId ?? 'root'] as const;

export function useFolders(parentId?: string) {
  return useQuery({
    queryKey: foldersQueryKey(parentId),
    queryFn: () => foldersApi.list(parentId),
  });
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: ['folders', id] as const,
    queryFn: () => foldersApi.get(id),
    enabled: Boolean(id),
  });
}
