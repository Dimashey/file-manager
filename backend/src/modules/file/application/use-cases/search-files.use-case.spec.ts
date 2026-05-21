/* eslint-disable @typescript-eslint/unbound-method */
import { SearchFilesUseCase } from './search-files.use-case';
import { SearchFilesCommand } from '../commands/search-files.command';
import { FileRepository } from '../../domain/repositories/file.repository';

describe('SearchFilesUseCase', () => {
  let useCase: SearchFilesUseCase;
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

    useCase = new SearchFilesUseCase(mockFileRepo);
  });

  describe('execute', () => {
    it('should call search on repository', async () => {
      mockFileRepo.search.mockResolvedValue([]);

      const cmd = new SearchFilesCommand('user-1', 'name');
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockFileRepo.search).toHaveBeenCalledWith('user-1', 'name');
    });
  });
});
