import { useMutation, useQueryClient } from '@tanstack/react-query';
import { foldersApi } from '../api/folders.api';
import { foldersQueryKey } from './useFolders';
import type { CreateFolderPayload, ReorderFolderItem, UpdateFolderPayload } from '../types/folder.types';

export function useCreateFolder(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateFolderPayload) => foldersApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: foldersQueryKey(parentId) }),
  });
}

export function useUpdateFolder(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFolderPayload }) =>
      foldersApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: foldersQueryKey(parentId) }),
  });
}

export function useDeleteFolder(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: foldersQueryKey(parentId) }),
  });
}

export function useCloneFolder(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => foldersApi.clone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: foldersQueryKey(parentId) }),
  });
}

export function useReorderFolders(parentId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderFolderItem[]) => foldersApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: foldersQueryKey(parentId) }),
  });
}
