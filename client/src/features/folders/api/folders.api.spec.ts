import { describe, it, expect, vi, beforeEach } from 'vitest';
import { foldersApi, publicFoldersApi } from './folders.api';
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

describe('folders.api', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('foldersApi', () => {
    it('should list folders with parentId param if provided', async () => {
      const mockFolders = [{ id: '1', name: 'Work', position: 0 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFolders });

      const result = await foldersApi.list('parent-123');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/folders', { params: { parentId: 'parent-123' } });
      expect(result).toEqual(mockFolders);
    });

    it('should list folders without params if parentId is not provided', async () => {
      const mockFolders = [{ id: '1', name: 'Work', position: 0 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockFolders });

      const result = await foldersApi.list();

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/folders', { params: undefined });
      expect(result).toEqual(mockFolders);
    });

    it('should create a new folder', async () => {
      const payload = { name: 'Photos', parentId: 'parent-123' };
      const mockFolder = { id: '2', ...payload, position: 0 };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockFolder });

      const result = await foldersApi.create(payload);

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/folders', payload);
      expect(result).toEqual(mockFolder);
    });

    it('should update folder contents', async () => {
      const payload = { name: 'Updated Photos', isPublic: true };
      const mockFolder = { id: '2', name: 'Updated Photos', isPublic: true, position: 0 };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: mockFolder });

      const result = await foldersApi.update('2', payload);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/folders/2', payload);
      expect(result).toEqual(mockFolder);
    });

    it('should delete a folder', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({});

      const result = await foldersApi.delete('2');

      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith('/folders/2');
      expect(result).toBeUndefined();
    });

    it('should clone a folder', async () => {
      const mockClonedFolder = { id: '3', name: 'Photos - Clone', position: 1 };
      vi.mocked(api.post).mockResolvedValueOnce({ data: mockClonedFolder });

      const result = await foldersApi.clone('2');

      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith('/folders/2/clone');
      expect(result).toEqual(mockClonedFolder);
    });

    it('should reorder folders', async () => {
      vi.mocked(api.patch).mockResolvedValueOnce({});
      const items = [{ id: '1', position: 1 }, { id: '2', position: 2 }];

      const result = await foldersApi.reorder(items);

      expect(api.patch).toHaveBeenCalledTimes(1);
      expect(api.patch).toHaveBeenCalledWith('/folders/reorder', { items });
      expect(result).toBeUndefined();
    });

    it('should search for folders', async () => {
      const mockSearchResults = [{ id: '1', name: 'Photos', position: 0 }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockSearchResults });

      const result = await foldersApi.search('Photo');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/folders/search', { params: { name: 'Photo' } });
      expect(result).toEqual(mockSearchResults);
    });
  });

  describe('publicFoldersApi', () => {
    it('should retrieve public folder contents', async () => {
      const mockContents = { id: 'public-123', files: [], name: 'Public Folder' };
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockContents });

      const result = await publicFoldersApi.getContents('public-123');

      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith('/folders/public/public-123');
      expect(result).toEqual(mockContents);
    });
  });
});
