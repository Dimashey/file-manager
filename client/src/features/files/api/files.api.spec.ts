import { describe, it, expect, vi, beforeEach } from 'vitest';
import { filesApi, publicFilesApi } from './files.api';
import api from '../../../lib/axios';

vi.mock('../../../lib/axios', () => {
  return {
    default: {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    },
  };
});

describe('files.api', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('filesApi', () => {
    it('should list files with folderId parameter if provided', async () => {
      const mockFiles = [{ id: 'f-1', name: 'resume.pdf' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiles });

      const result = await filesApi.list('folder-999');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/files', { params: { folderId: 'folder-999' } });
      expect(result).toEqual(mockFiles);
    });

    it('should list files without parameters if folderId is not provided', async () => {
      const mockFiles = [{ id: 'f-1', name: 'resume.pdf' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiles });

      const result = await filesApi.list();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/files', { params: undefined });
      expect(result).toEqual(mockFiles);
    });

    it('should upload a file', async () => {
      const mockFile = new File(['hello'], 'hello.txt', { type: 'text/plain' });
      const mockUploadedItem = { id: 'f-2', name: 'hello.txt', size: 5 };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockUploadedItem });

      const result = await filesApi.upload(mockFile, 'folder-123');

      expect(api.post).toHaveBeenCalledTimes(1);
      // Verify formData parameter contains correct values
      const calledArgs = vi.mocked(api.post).mock.calls[0];
      const formData = calledArgs[1] as FormData;
      expect(formData.get('file')).toBe(mockFile);
      expect(formData.get('folderId')).toBe('folder-123');
      expect(result).toEqual(mockUploadedItem);
    });

    it('should search for files', async () => {
      const mockFiles = [{ id: 'f-1', name: 'resume.pdf' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFiles });

      const result = await filesApi.search('resume');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/files/search', { params: { name: 'resume' } });
      expect(result).toEqual(mockFiles);
    });

    it('should update file details', async () => {
      const payload = { name: 'new-name.pdf', isPublic: true };
      const mockUpdatedFile = { id: 'f-1', name: 'new-name.pdf', isPublic: true };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: mockUpdatedFile });

      const result = await filesApi.update('f-1', payload);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/files/f-1', payload);
      expect(result).toEqual(mockUpdatedFile);
    });

    it('should delete a file', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({});

      const result = await filesApi.delete('f-1');

      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith('/files/f-1');
      expect(result).toBeUndefined();
    });

    it('should clone a file', async () => {
      const mockClonedFile = { id: 'f-2', name: 'resume - Copy.pdf' };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockClonedFile });

      const result = await filesApi.clone('f-1');

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/files/f-1/clone');
      expect(result).toEqual(mockClonedFile);
    });

    it('should reorder files', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({});
      const items = [{ id: 'f-1', position: 2 }, { id: 'f-2', position: 1 }];

      const result = await filesApi.reorder(items);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/files/reorder', { items });
      expect(result).toBeUndefined();
    });
  });

  describe('publicFilesApi', () => {
    it('should fetch public file metadata', async () => {
      const mockMeta = { id: 'f-1', name: 'resume.pdf', isPublic: true };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockMeta });

      const result = await publicFilesApi.getMetadata('f-1');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/files/public/f-1');
      expect(result).toEqual(mockMeta);
    });

    it('should generate download URL', () => {
      const result = publicFilesApi.getDownloadUrl('f-1');
      expect(result).toBe('http://localhost:3001/api/files/public/f-1/download');
    });
  });
});
