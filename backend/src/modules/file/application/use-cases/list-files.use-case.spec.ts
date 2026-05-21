/* eslint-disable @typescript-eslint/unbound-method */
import { ListFilesUseCase } from './list-files.use-case';
import { ListFilesCommand } from '../commands/list-files.command';
import { FileRepository } from '../../domain/repositories/file.repository';

describe('ListFilesUseCase', () => {
  let useCase: ListFilesUseCase;
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

    useCase = new ListFilesUseCase(mockFileRepo);
  });

  describe('execute', () => {
    it('should call findByOwner with correct params when folderId is root', async () => {
      mockFileRepo.findByOwner.mockResolvedValue([]);

      const cmd = new ListFilesCommand('user-1', undefined);
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockFileRepo.findByOwner).toHaveBeenCalledWith('user-1', null);
    });

    it('should call findByOwner with folderId when specified', async () => {
      mockFileRepo.findByOwner.mockResolvedValue([]);

      const cmd = new ListFilesCommand('user-1', 'folder-1');
      const result = await useCase.execute(cmd);

      expect(result).toEqual([]);
      expect(mockFileRepo.findByOwner).toHaveBeenCalledWith('user-1', 'folder-1');
    });
  });
});
