/* eslint-disable @typescript-eslint/unbound-method */
import { DeleteFileUseCase } from './delete-file.use-case';
import { DeleteFileCommand } from '../commands/delete-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

describe('DeleteFileUseCase', () => {
  let useCase: DeleteFileUseCase;
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

    useCase = new DeleteFileUseCase(mockFileRepo, mockStorage);
  });

  describe('execute', () => {
    it('should throw FileNotFoundError if the file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      const cmd = new DeleteFileCommand('user-1', 'file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FileNotFoundError);
      expect(mockFileRepo.findById).toHaveBeenCalledWith('file-1');
    });

    it('should throw FileNotFoundError if the file belongs to another user', async () => {
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

      const cmd = new DeleteFileCommand('user-1', 'file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FileNotFoundError);
      expect(mockFileRepo.findById).toHaveBeenCalledWith('file-1');
    });

    it('should delete file from storage and database when owner is correct and there is no thumbnail', async () => {
      const file = new File(
        'file-1',
        'test.txt',
        'test.txt',
        'text/plain',
        '.txt',
        100,
        'user-1/file-1.txt',
        null,
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockFileRepo.findById.mockResolvedValue(file);
      mockStorage.delete.mockResolvedValue();
      mockFileRepo.delete.mockResolvedValue();

      const cmd = new DeleteFileCommand('user-1', 'file-1');
      await useCase.execute(cmd);

      expect(mockStorage.delete).toHaveBeenCalledTimes(1);
      expect(mockStorage.delete).toHaveBeenCalledWith('user-1/file-1.txt');
      expect(mockFileRepo.delete).toHaveBeenCalledWith('file-1');
    });

    it('should delete file and its thumbnail from storage, and file from database when owner is correct and thumbnail exists', async () => {
      const file = new File(
        'file-1',
        'test.jpg',
        'test.jpg',
        'image/jpeg',
        '.jpg',
        1000,
        'user-1/file-1.jpg',
        'user-1/file-1-thumb.jpg',
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockFileRepo.findById.mockResolvedValue(file);
      mockStorage.delete.mockResolvedValue();
      mockFileRepo.delete.mockResolvedValue();

      const cmd = new DeleteFileCommand('user-1', 'file-1');
      await useCase.execute(cmd);

      expect(mockStorage.delete).toHaveBeenCalledTimes(2);
      expect(mockStorage.delete).toHaveBeenNthCalledWith(1, 'user-1/file-1.jpg');
      expect(mockStorage.delete).toHaveBeenNthCalledWith(2, 'user-1/file-1-thumb.jpg');
      expect(mockFileRepo.delete).toHaveBeenCalledWith('file-1');
    });
  });
});
