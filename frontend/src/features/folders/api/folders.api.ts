import { axiosClient } from '@/lib/axios';
import type { CreateFolderPayload, Folder, ReorderFolderItem, UpdateFolderPayload } from '../types/folder.types';

export const foldersApi = {
  list: async (parentId?: string): Promise<Folder[]> => {
    const { data } = await axiosClient.get<Folder[]>('/folders', { params: { parentId } });
    return data;
  },
  get: async (id: string): Promise<Folder> => {
    const { data } = await axiosClient.get<Folder>(`/folders/${id}`);
    return data;
  },
  create: async (payload: CreateFolderPayload): Promise<Folder> => {
    const { data } = await axiosClient.post<Folder>('/folders', payload);
    return data;
  },
  update: async (id: string, payload: UpdateFolderPayload): Promise<Folder> => {
    const { data } = await axiosClient.patch<Folder>(`/folders/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/folders/${id}`);
  },
  clone: async (id: string): Promise<Folder> => {
    const { data } = await axiosClient.post<Folder>(`/folders/${id}/clone`);
    return data;
  },
  reorder: async (items: ReorderFolderItem[]): Promise<void> => {
    await axiosClient.patch('/folders/reorder', { items });
  },
  search: async (name: string): Promise<Folder[]> => {
    const { data } = await axiosClient.get<Folder[]>('/folders/search', { params: { name } });
    return data;
  },
};
