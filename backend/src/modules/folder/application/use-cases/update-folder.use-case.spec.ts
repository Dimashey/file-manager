/* eslint-disable @typescript-eslint/unbound-method */
import { UpdateFolderUseCase } from './update-folder.use-case';
import { UpdateFolderCommand } from '../commands/update-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';
import { InvalidParentFolderError } from '../../domain/errors/invalid-parent-folder.error';

describe('UpdateFolderUseCase', () => {
  let useCase: UpdateFolderUseCase;
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

    useCase = new UpdateFolderUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should throw FolderNotFoundError if folder does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const cmd = new UpdateFolderCommand('user-1', 'folder-1', 'New Name');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
    });

    it('should throw InvalidParentFolderError if target parent folder does not exist', async () => {
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
      mockRepo.findById.mockImplementation((id) => {
        if (id === 'folder-1') return Promise.resolve(folder);
        return Promise.resolve(null);
      });

      const cmd = new UpdateFolderCommand('user-1', 'folder-1', undefined, 'parent-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(InvalidParentFolderError);
    });

    it('should throw InvalidParentFolderError if target parent belongs to another user', async () => {
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
      mockRepo.findById.mockImplementation((id) => {
        if (id === 'folder-1') return Promise.resolve(folder);
        if (id === 'parent-1') return Promise.resolve(parent);
        return Promise.resolve(null);
      });

      const cmd = new UpdateFolderCommand('user-1', 'folder-1', undefined, 'parent-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(InvalidParentFolderError);
    });

    it('should update folder name, public status, and parent folder successfully', async () => {
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
      mockRepo.findById.mockImplementation((id) => {
        if (id === 'folder-1') return Promise.resolve(folder);
        if (id === 'parent-1') return Promise.resolve(parent);
        return Promise.resolve(null);
      });
      mockRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new UpdateFolderCommand('user-1', 'folder-1', 'Updated Folder', 'parent-1', true);
      const result = await useCase.execute(cmd);

      expect(result.name).toBe('Updated Folder');
      expect(result.isPublic).toBe(true);
      expect(result.parentId).toBe('parent-1');
      expect(mockRepo.save).toHaveBeenCalledWith(folder);
    });
  });
});
