/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateFileUseCase } from './update-file.use-case';
import { UpdateFileCommand } from '../commands/update-file.command';
import { FileRepository } from '../../domain/repositories/file.repository';
import { File } from '../../domain/file.entity';
import { FileMovePolicy } from '../../domain/policies/file-file.policy';
import { FileNotFoundError } from '../../domain/errors/file-not-found.error';
import { CanNotMoveFileToFolderError } from '../../domain/errors/can-not-move-file.error';

describe('UpdateFileUseCase', () => {
  let useCase: UpdateFileUseCase;
  let mockFileRepo: jest.Mocked<FileRepository>;
  let mockMovePolicy: jest.Mocked<FileMovePolicy>;

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

    mockMovePolicy = {
      canMoveToFolder: jest.fn(),
    };

    useCase = new UpdateFileUseCase(mockFileRepo, mockMovePolicy);
  });

  describe('execute', () => {
    it('should throw FileNotFoundError if file does not exist', async () => {
      mockFileRepo.findById.mockResolvedValue(null);

      const cmd = new UpdateFileCommand('user-1', 'file-1');

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

      const cmd = new UpdateFileCommand('user-1', 'file-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FileNotFoundError);
    });

    it('should throw CanNotMoveFileToFolderError if move policy denies movement', async () => {
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
      mockMovePolicy.canMoveToFolder.mockResolvedValue(false);

      const cmd = new UpdateFileCommand('user-1', 'file-1', undefined, 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(CanNotMoveFileToFolderError);
      expect(mockMovePolicy.canMoveToFolder).toHaveBeenCalledWith('folder-1', 'user-1');
    });

    it('should update properties successfully', async () => {
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
      mockMovePolicy.canMoveToFolder.mockResolvedValue(true);
      mockFileRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new UpdateFileCommand('user-1', 'file-1', 'New Name.txt', 'folder-1', true);

      const result = await useCase.execute(cmd);

      expect(result.name).toBe('New Name.txt');
      expect(result.folderId).toBe('folder-1');
      expect(result.isPublic).toBe(true);
      expect(mockFileRepo.save).toHaveBeenCalledWith(file);
    });
  });
});
