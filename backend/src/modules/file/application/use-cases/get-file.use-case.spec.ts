import { GetFileUseCase } from './get-file.use-case';
import { FileRepository } from '../../domain/repositories/file.repository';
import { File } from '../../domain/file.entity';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';

describe('GetFileUseCase', () => {
  let useCase: GetFileUseCase;
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

    useCase = new GetFileUseCase(mockFileRepo);
  });

  describe('execute', () => {
    it('should throw FileNotFoundError if file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute({ userId: 'user-1', fileId: 'file-1' })).rejects.toThrow(
        FileNotFoundError,
      );
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

      await expect(useCase.execute({ userId: 'user-1', fileId: 'file-1' })).rejects.toThrow(
        FileNotFoundError,
      );
    });

    it('should return file when owner is correct', async () => {
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

      const result = await useCase.execute({ userId: 'user-1', fileId: 'file-1' });

      expect(result).toBe(file);
    });
  });
});
