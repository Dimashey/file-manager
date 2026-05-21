/* eslint-disable @typescript-eslint/unbound-method */
import { ReorderFoldersUseCase } from './reorder-folders.use-case';
import { ReorderFoldersCommand } from '../commands/reorder-folders.command';
import { FolderRepository } from '../../domain/repositories/folder.repository';

describe('ReorderFoldersUseCase', () => {
  let useCase: ReorderFoldersUseCase;
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

    useCase = new ReorderFoldersUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should call updatePositions on repository with command items', async () => {
      mockRepo.updatePositions.mockResolvedValue(undefined);

      const items = [
        { id: 'folder-1', position: 1 },
        { id: 'folder-2', position: 2 },
      ];
      const cmd = new ReorderFoldersCommand('user-1', items);

      await useCase.execute(cmd);

      expect(mockRepo.updatePositions).toHaveBeenCalledWith(items, 'user-1');
    });
  });
});
