/* eslint-disable @typescript-eslint/unbound-method */
import { DeleteFolderUseCase } from './delete-folder.use-case';
import { DeleteFolderCommand } from '../commands/delete-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

describe('DeleteFolderUseCase', () => {
  let useCase: DeleteFolderUseCase;
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

    useCase = new DeleteFolderUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should throw FolderNotFoundError if folder does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const cmd = new DeleteFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
      expect(mockRepo.findById).toHaveBeenCalledWith('folder-1');
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

      const cmd = new DeleteFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
    });

    it('should successfully delete folder when owner matches', async () => {
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
      mockRepo.delete.mockResolvedValue(undefined);

      const cmd = new DeleteFolderCommand('user-1', 'folder-1');
      await useCase.execute(cmd);

      expect(mockRepo.delete).toHaveBeenCalledWith('folder-1');
    });
  });
});
