import { useQuery } from '@tanstack/react-query';
import { filesApi } from '../api/files.api';

export const filesQueryKey = (folderId?: string) => ['files', folderId ?? 'root'] as const;

export function useFiles(folderId?: string) {
  return useQuery({
    queryKey: filesQueryKey(folderId),
    queryFn: () => filesApi.list(folderId),
  });
}
