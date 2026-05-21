import { GetFolderUseCase } from './get-folder.use-case';
import { GetFolderCommand } from '../commands/get-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

describe('GetFolderUseCase', () => {
  let useCase: GetFolderUseCase;
  let mockRepo: jest.Mocked<FolderRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      findByOwner: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      updatePosition: jest.fn(),
      updatePositions: jest.fn(),
      findChildren: jest.fn(),
      search: jest.fn(),
      findSubfolders: jest.fn(),
    };

    useCase = new GetFolderUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should throw FolderNotFoundError if folder does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const cmd = new GetFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
    });

    it('should throw FolderNotFoundError if folder belongs to another user', async () => {
      const folder = new Folder(
        'folder-1',
        'Folder',
        null,
        'user-2',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(folder);

      const cmd = new GetFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
    });

    it('should return folder when owner matches', async () => {
      const folder = new Folder(
        'folder-1',
        'Folder',
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(folder);

      const cmd = new GetFolderCommand('user-1', 'folder-1');
      const result = await useCase.execute(cmd);

      expect(result).toBe(folder);
    });
  });
});
