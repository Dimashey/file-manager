import { GetPublicFileUseCase } from './get-public-file.use-case';
import { GetPublicFileCommand } from '../commands/get-public-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { File } from '../../domain/file.entity';
import { SharedFileNotFoundError } from '../../domain/errors/shared-file-not-found.error';

describe('GetPublicFileUseCase', () => {
  let useCase: GetPublicFileUseCase;
  let mockFileRepo: jest.Mocked<FileRepository>;

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

    useCase = new GetPublicFileUseCase(mockFileRepo);
  });

  describe('execute', () => {
    it('should throw SharedFileNotFoundError if file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      const cmd = new GetPublicFileCommand('file-1');

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

      const cmd = new GetPublicFileCommand('file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(SharedFileNotFoundError);
    });

    it('should return file when it is public', async () => {
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
      mockFileRepo.findById.mockResolvedValue(file);

      const cmd = new GetPublicFileCommand('file-1');
      const result = await useCase.execute(cmd);

      expect(result).toBe(file);
    });
  });
});
