import { useMutation, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '../api/files.api';
import { filesQueryKey } from './useFiles';
import type { ReorderFileItem, UpdateFilePayload } from '../types/file.types';

export function useUploadFile(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => filesApi.upload(file, folderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesQueryKey(folderId) }),
  });
}

export function useUpdateFile(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFilePayload }) =>
      filesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesQueryKey(folderId) }),
  });
}

export function useDeleteFile(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesQueryKey(folderId) }),
  });
}

export function useCloneFile(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.clone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesQueryKey(folderId) }),
  });
}

export function useReorderFiles(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderFileItem[]) => filesApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: filesQueryKey(folderId) }),
  });
}
