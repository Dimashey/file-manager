import { axiosClient } from '@/lib/axios';
import type { FileRecord, ReorderFileItem, UpdateFilePayload } from '../types/file.types';

export const filesApi = {
  list: async (folderId?: string): Promise<FileRecord[]> => {
    const { data } = await axiosClient.get<FileRecord[]>('/files', { params: { folderId } });
    return data;
  },
  get: async (id: string): Promise<FileRecord> => {
    const { data } = await axiosClient.get<FileRecord>(`/files/${id}`);
    return data;
  },
  upload: async (file: File, folderId?: string): Promise<FileRecord> => {
    const form = new FormData();
    form.append('file', file);
    if (folderId) form.append('folderId', folderId);
    const { data } = await axiosClient.post<FileRecord>('/files/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  update: async (id: string, payload: UpdateFilePayload): Promise<FileRecord> => {
    const { data } = await axiosClient.patch<FileRecord>(`/files/${id}`, payload);
    return data;
  },
  remove: async (id: string): Promise<void> => {
    await axiosClient.delete(`/files/${id}`);
  },
  clone: async (id: string): Promise<FileRecord> => {
    const { data } = await axiosClient.post<FileRecord>(`/files/${id}/clone`);
    return data;
  },
  reorder: async (items: ReorderFileItem[]): Promise<void> => {
    await axiosClient.patch('/files/reorder', { items });
  },
  search: async (name: string): Promise<FileRecord[]> => {
    const { data } = await axiosClient.get<FileRecord[]>('/files/search', { params: { name } });
    return data;
  },
  downloadUrl: (id: string): string => {
    const base = (import.meta.env['VITE_API_URL'] ?? 'http://localhost:3001/api') as string;
    return `${base}/files/${id}/download`;
  },
};
