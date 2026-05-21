/* eslint-disable @typescript-eslint/unbound-method */
import { GetPublicFolderUseCase } from './get-public-folder.use-case';
import { GetPublicFolderCommand } from '../commands/get-public-folder.command';
import { Folder } from '../../domain/folder.entity';
import { FolderRepository } from '../../domain/repositories/folder.repository';
import { FileRepository } from '../../../file/domain/repositories/file.repository';
import { File } from '../../../file/domain/file.entity';
import { SharedFolderNotFoundError } from '../../domain/errors/shared-folder-not-found.error';

describe('GetPublicFolderUseCase', () => {
  let useCase: GetPublicFolderUseCase;
  let mockFolderRepo: jest.Mocked<FolderRepository>;
  let mockFileRepo: jest.Mocked<FileRepository>;

  beforeEach(() => {
    mockFolderRepo = {
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

    useCase = new GetPublicFolderUseCase(mockFolderRepo, mockFileRepo);
  });

  describe('execute', () => {
    it('should throw SharedFolderNotFoundError if folder does not exist', async () => {
      mockFolderRepo.findById.mockResolvedValue(null);

      const cmd = new GetPublicFolderCommand('folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(SharedFolderNotFoundError);
    });

    it('should throw SharedFolderNotFoundError if folder is not public', async () => {
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
      mockFolderRepo.findById.mockResolvedValue(folder);

      const cmd = new GetPublicFolderCommand('folder-1');

      await expect(useCase.execute(cmd)).rejects.toThrow(SharedFolderNotFoundError);
    });

    it('should return folder, subfolders, and files when folder is public', async () => {
      const folder = new Folder(
        'folder-1',
        'Folder',
        null,
        'user-1',
        true,
        0,
        new Date(),
        new Date(),
      );
      const subfolders = [
        new Folder('folder-2', 'Sub', 'folder-1', 'user-1', true, 0, new Date(), new Date()),
      ];
      const files: File[] = [];

      mockFolderRepo.findById.mockResolvedValue(folder);
      mockFolderRepo.findSubfolders.mockResolvedValue(subfolders);
      mockFileRepo.findByFolder.mockResolvedValue(files);

      const cmd = new GetPublicFolderCommand('folder-1');
      const result = await useCase.execute(cmd);

      expect(result).toEqual({ folder, subfolders, files });
      expect(mockFolderRepo.findSubfolders).toHaveBeenCalledWith('folder-1');
      expect(mockFileRepo.findByFolder).toHaveBeenCalledWith('folder-1');
    });
  });
});
