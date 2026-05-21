/* eslint-disable @typescript-eslint/unbound-method */
import { Readable } from 'stream';
import { DownloadFileUseCase } from './download-file.use-case';
import { DownloadFileCommand } from '../commands/download-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

describe('DownloadFileUseCase', () => {
  let useCase: DownloadFileUseCase;
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

    useCase = new DownloadFileUseCase(mockFileRepo, mockStorage);
  });

  describe('execute', () => {
    it('should throw FileNotFoundError if file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      const cmd = new DownloadFileCommand('user-1', 'file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FileNotFoundError);
    });

    it('should throw FileNotFoundError if file belongs to another user', async () => {
      const file = new File(
        'file-1',
        'a.txt',
        'a.txt',
        'text/plain',
        '.txt',
        10,
        'key',
        null,
        null,
        'user-2',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockFileRepo.findById.mockResolvedValue(file);

      const cmd = new DownloadFileCommand('user-1', 'file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FileNotFoundError);
    });

    it('should return read stream and file metadata successfully', async () => {
      const file = new File(
        'file-1',
        'a.txt',
        'a.txt',
        'text/plain',
        '.txt',
        10,
        'key',
        null,
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      const mockStream = Readable.from([]);
      mockFileRepo.findById.mockResolvedValue(file);
      mockStorage.download.mockResolvedValue(mockStream);

      const cmd = new DownloadFileCommand('user-1', 'file-1');
      const result = await useCase.execute(cmd);

      expect(result).toEqual({ stream: mockStream, file });
      expect(mockStorage.download).toHaveBeenCalledWith('key');
    });
  });
});
