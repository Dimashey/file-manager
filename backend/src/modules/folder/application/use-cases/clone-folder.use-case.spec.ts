/* eslint-disable @typescript-eslint/unbound-method */
import { CloneFolderUseCase } from './clone-folder.use-case';
import { CloneFolderCommand } from '../commands/clone-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FolderNotFoundError } from '../../domain/errors/folder-not-found.error';

describe('CloneFolderUseCase', () => {
  let useCase: CloneFolderUseCase;
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

    useCase = new CloneFolderUseCase(mockRepo);
  });

  describe('execute', () => {
    it('should throw FolderNotFoundError if the folder does not exist', async () => {
      mockRepo.findById.mockResolvedValue(null);

      const cmd = new CloneFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
      expect(mockRepo.findById).toHaveBeenCalledWith('folder-1');
    });

    it('should throw FolderNotFoundError if the folder does not belong to the user', async () => {
      const folder = new Folder(
        'folder-1',
        'My Folder',
        null,
        'other-user',
        false,
        0,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(folder);

      const cmd = new CloneFolderCommand('user-1', 'folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(FolderNotFoundError);
      expect(mockRepo.findById).toHaveBeenCalledWith('folder-1');
    });

    it('should successfully clone a single folder without children', async () => {
      const folder = new Folder(
        'folder-1',
        'My Folder',
        'parent-id',
        'user-1',
        false,
        2,
        new Date(),
        new Date(),
      );
      mockRepo.findById.mockResolvedValue(folder);
      mockRepo.findChildren.mockResolvedValue([]);
      mockRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new CloneFolderCommand('user-1', 'folder-1');
      const result = await useCase.execute(cmd);

      expect(result).toBeInstanceOf(Folder);
      expect(result.id).not.toBe('folder-1');
      expect(result.name).toBe('My Folder (copy)');
      expect(result.parentId).toBe('parent-id');
      expect(result.ownerId).toBe('user-1');
      expect(result.isPublic).toBe(false);
      expect(result.position).toBe(2);

      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockRepo.findChildren).toHaveBeenCalledWith('folder-1', 'user-1');
    });

    it('should recursively clone folder and its subfolders', async () => {
      const rootFolder = new Folder(
        'root-1',
        'Root Folder',
        null,
        'user-1',
        false,
        0,
        new Date(),
        new Date(),
      );
      const childFolder = new Folder(
        'child-1',
        'Child Folder',
        'root-1',
        'user-1',
        false,
        1,
        new Date(),
        new Date(),
      );

      mockRepo.findById.mockResolvedValue(rootFolder);
      mockRepo.findChildren.mockImplementation((parentId) => {
        if (parentId === 'root-1') {
          return Promise.resolve([childFolder]);
        }
        return Promise.resolve([]);
      });
      mockRepo.save.mockImplementation((f) => Promise.resolve(f));

      const cmd = new CloneFolderCommand('user-1', 'root-1');
      const result = await useCase.execute(cmd);

      expect(result).toBeInstanceOf(Folder);
      expect(result.name).toBe('Root Folder (copy)');
      expect(result.parentId).toBeNull();

      expect(mockRepo.save).toHaveBeenCalledTimes(2);
      expect(mockRepo.findChildren).toHaveBeenCalledWith('root-1', 'user-1');
      expect(mockRepo.save).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          name: 'Child Folder',
          ownerId: 'user-1',
        }),
      );
    });
  });
});
