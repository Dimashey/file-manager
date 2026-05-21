import api from './axios';
import type { Folder, FolderReorderItem } from '../types/folder';

export interface CreateFolderPayload {
  name: string;
  parentId?: string;
}

export interface UpdateFolderPayload {
  name?: string;
  parentId?: string | null;
  isPublic?: boolean;
}

export const foldersApi = {
  list: (parentId?: string) =>
    api
      .get<Folder[]>('/folders', { params: parentId ? { parentId } : undefined })
      .then((r) => r.data),

  create: (payload: CreateFolderPayload) =>
    api.post<Folder>('/folders', payload).then((r) => r.data),

  update: (id: string, payload: UpdateFolderPayload) =>
    api.patch<Folder>(`/folders/${id}`, payload).then((r) => r.data),

  delete: (id: string) => api.delete(`/folders/${id}`).then(() => undefined),

  clone: (id: string) => api.post<Folder>(`/folders/${id}/clone`).then((r) => r.data),

  reorder: (items: FolderReorderItem[]) =>
    api.patch('/folders/reorder', { items }).then(() => undefined),

  search: (name: string) =>
    api.get<Folder[]>('/folders/search', { params: { name } }).then((r) => r.data),
};
