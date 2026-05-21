import api from './axios';
import type { FileItem, FileReorderItem } from '../types/file';

export interface UpdateFilePayload {
  name?: string;
  folderId?: string | null;
  isPublic?: boolean;
}

export const filesApi = {
  list: (folderId?: string) =>
    api
      .get<FileItem[]>('/files', { params: folderId ? { folderId } : undefined })
      .then((r) => r.data),

  upload: (file: File, folderId?: string | null) => {
    const fd = new FormData();
    fd.append('file', file);
    if (folderId) fd.append('folderId', folderId);
    return api.post<FileItem>('/files/upload', fd).then((r) => r.data);
  },

  search: (name: string) =>
    api.get<FileItem[]>('/files/search', { params: { name } }).then((r) => r.data),

  update: (id: string, payload: UpdateFilePayload) =>
    api.patch<FileItem>(`/files/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/files/${id}`).then(() => undefined),

  clone: (id: string) => api.post<FileItem>(`/files/${id}/clone`).then((r) => r.data),

  reorder: (items: FileReorderItem[]) =>
    api.patch('/files/reorder', { items }).then(() => undefined),

  download: async (id: string, filename: string) => {
    const res = await api.get(`/files/${id}/download`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
