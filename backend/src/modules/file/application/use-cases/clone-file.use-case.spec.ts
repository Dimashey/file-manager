/* eslint-disable @typescript-eslint/unbound-method */
import { CloneFileUseCase } from './clone-file.use-case';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

describe('CloneFileUseCase', () => {
  let useCase: CloneFileUseCase;
  let mockFileRepo: jest.Mocked<FileRepository>;
  let mockStorage: jest.Mocked<FileStorageService>;

  beforeEach(() => {
    mockFileRepo = {
      findById: jest.fn(),
      findByOwner: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updatePosition: jest.fn(),
      updatePositions: jest.fn(),
      search: jest.fn(),
      findByFolder: jest.fn(),
    };

    mockStorage = {
      upload: jest.fn(),
      download: jest.fn(),
      delete: jest.fn(),
      copy: jest.fn(),
    };

    useCase = new CloneFileUseCase(mockFileRepo, mockStorage);
  });

  describe('execute', () => {
    it('should throw FileNotFoundError if the file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute({ userId: 'user-1', fileId: 'file-1' })).rejects.toThrow(
        FileNotFoundError,
      );
      expect(mockFileRepo.findById).toHaveBeenCalledWith('file-1');
    });

    it('should throw FileNotFoundError if the file belongs to a different user', async () => {
      const file = new File(
        'file-1',
        'test.txt',
        'test.txt',
        'text/plain',
        '.txt',
        100,
        'user-2/file-1.txt',
        null,
        null,
        'user-2',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockFileRepo.findById.mockResolvedValue(file);

      await expect(useCase.execute({ userId: 'user-1', fileId: 'file-1' })).rejects.toThrow(
        FileNotFoundError,
      );
      expect(mockFileRepo.findById).toHaveBeenCalledWith('file-1');
    });

    it('should clone the file successfully when it belongs to the user', async () => {
      const file = new File(
        'file-1',
        'test.txt',
        'test.txt',
        'text/plain',
        '.txt',
        100,
        'user-1/file-1.txt',
        null,
        'folder-1',
        'user-1',
        false,
        1,
        new Date(),
        new Date(),
      );

      mockFileRepo.findById.mockResolvedValue(file);
      mockStorage.copy.mockResolvedValue('new-storage-path');
      mockFileRepo.save.mockImplementation((savedFile) => Promise.resolve(savedFile));

      const result = await useCase.execute({ userId: 'user-1', fileId: 'file-1' });

      expect(result).toBeInstanceOf(File);
      expect(result.id).not.toBe('file-1');
      expect(result.name).toBe('test.txt (copy)');
      expect(result.originalName).toBe('test.txt');
      expect(result.mimeType).toBe('text/plain');
      expect(result.extension).toBe('.txt');
      expect(result.size).toBe(100);
      expect(result.storagePath).toContain('user-1/');
      expect(result.storagePath).toContain('.txt');
      expect(result.folderId).toBe('folder-1');
      expect(result.ownerId).toBe('user-1');
      expect(result.isPublic).toBe(false);
      expect(result.position).toBe(1);

      expect(mockStorage.copy).toHaveBeenCalledWith('user-1/file-1.txt', result.storagePath);
      expect(mockFileRepo.save).toHaveBeenCalledWith(result);
    });
  });
});
