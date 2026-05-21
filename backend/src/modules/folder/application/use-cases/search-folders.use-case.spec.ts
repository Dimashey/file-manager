/* eslint-disable @typescript-eslint/unbound-method */
import { SearchFoldersUseCase } from './search-folders.use-case';
import { SearchFoldersCommand } from '../commands/search-folders.command';
import { FolderRepository } from '../../domain/repositories/folder.repository';

describe('SearchFoldersUseCase', () => {
  let useCase: SearchFoldersUseCase;
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

    useCase = new SearchFoldersUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should call search on repository', async () => {
      mockRepo.search.mockResolvedValue([]);

      const cmd = new SearchFoldersCommand('user-1', 'query');
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockRepo.search).toHaveBeenCalledWith('user-1', 'query');
    });
  });
});
