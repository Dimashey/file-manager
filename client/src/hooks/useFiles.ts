import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi, type UpdateFilePayload } from '../api/files.api';
import type { FileItem, FileReorderItem } from '../types/file';

const fileKeys = {
  all: ['files'] as const,
  list: (folderId?: string) => ['files', folderId ?? null] as const,
};

export function useFiles(folderId?: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: fileKeys.list(folderId),
    queryFn: () => filesApi.list(folderId),
    enabled: options?.enabled,
  });
}

export function useUploadFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, folderId }: { file: File; folderId?: string | null }) =>
      filesApi.upload(file, folderId ?? undefined),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}

export function useUpdateFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateFilePayload }) =>
      filesApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}

export function useDeleteFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}

export function useCloneFile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => filesApi.clone(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}

export function useReorderFiles(folderId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: FileReorderItem[]) => filesApi.reorder(items),
    onMutate: async (items) => {
      const key = fileKeys.list(folderId);
      await qc.cancelQueries({ queryKey: key });
      const snapshot = qc.getQueryData<FileItem[]>(key);
      qc.setQueryData<FileItem[]>(key, (prev) => {
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
        qc.setQueryData(fileKeys.list(folderId), ctx.snapshot);
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: fileKeys.all }),
  });
}
