/* eslint-disable @typescript-eslint/unbound-method */
import { ReorderFilesUseCase } from './reorder.use-case';
import { ReorderFilesCommand } from '../commands/reorder.command';
import { FileRepository } from '../../domain/repositories/file.repository';

describe('ReorderFilesUseCase', () => {
  let useCase: ReorderFilesUseCase;
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

    useCase = new ReorderFilesUseCase(mockFileRepo);
  });

  describe('execute', () => {
    it('should call updatePositions on repository with items', async () => {
      mockFileRepo.updatePositions.mockResolvedValue(undefined);

      const items = [
        { id: 'file-1', position: 1 },
        { id: 'file-2', position: 2 },
      ];
      const cmd = new ReorderFilesCommand('user-1', items);

      await useCase.execute(cmd);

      expect(mockFileRepo.updatePositions).toHaveBeenCalledWith(items, 'user-1');
    });
  });
});
