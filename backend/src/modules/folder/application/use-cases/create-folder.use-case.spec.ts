/* eslint-disable @typescript-eslint/unbound-method */
import { CreateFolderUseCase } from './create-folder.use-case';
import { CreateFolderCommand } from '../commands/create-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

describe('CreateFolderUseCase', () => {
  let useCase: CreateFolderUseCase;
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

    useCase = new CreateFolderUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should throw InvalidParentFolderError if parent folder does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const cmd = new CreateFolderCommand('user-1', 'My Folder', 'parent-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(InvalidParentFolderError);
      expect(mockRepo.findById).toHaveBeenCalledWith('parent-1');
    });

    it('should throw InvalidParentFolderError if parent folder belongs to another user', async () => {
      const parent = new Folder(
        'parent-1',
        'Parent',
        null,
        'user-2',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(parent);

      const cmd = new CreateFolderCommand('user-1', 'My Folder', 'parent-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(InvalidParentFolderError);
      expect(mockRepo.findById).toHaveBeenCalledWith('parent-1');
    });

    it('should create root folder successfully', async () => {
      mockRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new CreateFolderCommand('user-1', 'My Folder', undefined);
      const result = await useCase.execute(cmd);

      expect(result).toBeInstanceOf(Folder);
      expect(result.name).toBe('My Folder');
      expect(result.parentId).toBeNull();
      expect(result.ownerId).toBe('user-1');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should create child folder successfully', async () => {
      const parent = new Folder(
        'parent-1',
        'Parent',
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(parent);
      mockRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new CreateFolderCommand('user-1', 'Child Folder', 'parent-1');
      const result = await useCase.execute(cmd);

      expect(result).toBeInstanceOf(Folder);
      expect(result.name).toBe('Child Folder');
      expect(result.parentId).toBe('parent-1');
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
