/* eslint-disable @typescript-eslint/unbound-method */
import { Readable } from 'stream';
import { DownloadPublicFileUseCase } from './download-public-file.use-case';
import { DownloadPublicFileCommand } from '../commands/download-public-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { FileStorageService } from '../interfaces/file-storage.service';
import { File } from '../../domain/file.entity';
import { SharedFileNotFoundError } from '../../domain/errors/shared-file-not-found.error';

describe('DownloadPublicFileUseCase', () => {
  let useCase: DownloadPublicFileUseCase;
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

    useCase = new DownloadPublicFileUseCase(mockFileRepo, mockStorage);
  });

  describe('execute', () => {
    it('should throw SharedFileNotFoundError if file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      const cmd = new DownloadPublicFileCommand('file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(SharedFileNotFoundError);
    });

    it('should throw SharedFileNotFoundError if file is not public', async () => {
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
      mockFileRepo.findById.mockResolvedValue(file);

      const cmd = new DownloadPublicFileCommand('file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(SharedFileNotFoundError);
    });

    it('should return read stream and file successfully', async () => {
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
        true,
        0,
        new Date(),
        new Date(),
      );
      const mockStream = Readable.from([]);
      mockFileRepo.findById.mockResolvedValue(file);
      mockStorage.download.mockResolvedValue(mockStream);

      const cmd = new DownloadPublicFileCommand('file-1');
      const result = await useCase.execute(cmd);

      expect(result).toEqual({ stream: mockStream, file });
      expect(mockStorage.download).toHaveBeenCalledWith('key');
    });
  });
});
