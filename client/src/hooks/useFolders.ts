import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { foldersApi, type CreateFolderPayload, type UpdateFolderPayload } from '../api/folders.api';
import type { Folder, FolderReorderItem } from '../types/folder';

const folderKeys = {
  all: ['folders'] as const,
  list: (parentId?: string) => ['folders', parentId ?? null] as const,
};

export function useFolders(parentId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: folderKeys.list(parentId),
    queryFn: () => foldersApi.list(parentId),
    enabled: options?.enabled,
  });
}

export function useCreateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFolderPayload) => foldersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.all }),
  });
}

export function useUpdateFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFolderPayload }) =>
      foldersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.all }),
  });
}

export function useDeleteFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.all }),
  });
}

export function useCloneFolder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.clone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: folderKeys.all }),
  });
}

export function useReorderFolders(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: FolderReorderItem[]) => foldersApi.reorder(items),
    onMutate: async (items) => {
      const key = folderKeys.list(parentId);
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<Folder[]>(key);
      qc.setQueryData<Folder[]>(key, (prev) => {
        if (!prev) return prev;
        const posMap = new Map(items.map((i) => [i.id, i.position]));
        return [...prev]
          .map((f) => ({ ...f, position: posMap.get(f.id) ?? f.position }))
          .sort((a, b) => a.position - b.position);
      });
      return { snapshot };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshot) {
        qc.setQueryData(folderKeys.list(parentId), ctx.snapshot);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: folderKeys.all }),
  });
}
