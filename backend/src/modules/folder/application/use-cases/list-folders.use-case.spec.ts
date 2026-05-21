/* eslint-disable @typescript-eslint/unbound-method */
import { ListFoldersUseCase } from './list-folders.use-case';
import { ListFoldersCommand } from '../commands/list-folders.command';
import { FolderRepository } from '../../domain/repositories/folder.repository';

describe('ListFoldersUseCase', () => {
  let useCase: ListFoldersUseCase;
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

    useCase = new ListFoldersUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should call findByOwner on repository with root parent', async () => {
      mockRepo.findByOwner.mockResolvedValue([]);

      const cmd = new ListFoldersCommand('user-1', undefined);
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockRepo.findByOwner).toHaveBeenCalledWith('user-1', null);
    });

    it('should call findByOwner with subfolder parent', async () => {
      mockRepo.findByOwner.mockResolvedValue([]);

      const cmd = new ListFoldersCommand('user-1', 'parent-1');
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockRepo.findByOwner).toHaveBeenCalledWith('user-1', 'parent-1');
    });
  });
});
